export const dashboardModuleNames = [
  "fieldTests",
  "products",
  "comparisons",
  "subscribers",
] as const;

export type DashboardModuleName = (typeof dashboardModuleNames)[number];
export type DashboardCountName =
  | DashboardModuleName
  | "confirmedSubscribers";

export type DashboardDegradedCode =
  | "FIELD_TESTS_UNAVAILABLE"
  | "PRODUCTS_UNAVAILABLE"
  | "COMPARISONS_UNAVAILABLE"
  | "SUBSCRIBERS_UNAVAILABLE";

export interface DashboardSummaryResponse {
  ok: true;
  counts: Record<DashboardCountName, number | null>;
  health: {
    status: "healthy" | "degraded";
    modules: Record<DashboardModuleName, "available" | "unavailable">;
  };
  degradedCodes: DashboardDegradedCode[];
}

export interface DashboardSummaryErrorResponse {
  ok: false;
  error: {
    code: "D1_BINDING_MISSING" | "UPSTREAM_FAILURE";
  };
}

export type DashboardCountReaders = {
  fieldTests: () => Promise<number>;
  products: () => Promise<number>;
  comparisons: () => Promise<number>;
  subscribers: () => Promise<{ total: number; confirmed: number }>;
};

type DashboardAuthorization = { email: string } | Response;

/** HTTP boundary kept injectable so authorization and infrastructure failures are contract-tested. */
export function createDashboardSummaryHandler(dependencies: {
  authorize: () => Promise<DashboardAuthorization>;
  hasDatabase: () => boolean;
  load: () => Promise<DashboardSummaryResponse>;
}) {
  return async function handleDashboardSummary(): Promise<Response> {
    const operator = await dependencies.authorize();
    if (operator instanceof Response) return operator;
    if (!dependencies.hasDatabase()) {
      return Response.json(
        { ok: false, error: { code: "D1_BINDING_MISSING" } },
        { status: 503 },
      );
    }

    try {
      const summary = await dependencies.load();
      if (summary.health.status === "degraded" &&
          Object.values(summary.health.modules).every((health) => health === "unavailable")) {
        return Response.json(
          { ok: false, error: { code: "UPSTREAM_FAILURE" } },
          { status: 502 },
        );
      }
      return Response.json(summary);
    } catch {
      return Response.json(
        { ok: false, error: { code: "UPSTREAM_FAILURE" } },
        { status: 502 },
      );
    }
  };
}

const degradedCodeByModule: Record<DashboardModuleName, DashboardDegradedCode> = {
  fieldTests: "FIELD_TESTS_UNAVAILABLE",
  products: "PRODUCTS_UNAVAILABLE",
  comparisons: "COMPARISONS_UNAVAILABLE",
  subscribers: "SUBSCRIBERS_UNAVAILABLE",
};

const isCount = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;

/** Build one bounded summary while allowing independent modules to degrade. */
export async function loadDashboardSummary(
  readers: DashboardCountReaders,
): Promise<DashboardSummaryResponse> {
  const results = await Promise.allSettled(
    dashboardModuleNames.map((module) => readers[module]()),
  );
  const counts: DashboardSummaryResponse["counts"] = {
    fieldTests: null,
    products: null,
    comparisons: null,
    subscribers: null,
    confirmedSubscribers: null,
  };
  const modules = {} as DashboardSummaryResponse["health"]["modules"];
  const degradedCodes: DashboardDegradedCode[] = [];

  results.forEach((result, index) => {
    const module = dashboardModuleNames[index];
    if (result.status === "rejected") {
      modules[module] = "unavailable";
      degradedCodes.push(degradedCodeByModule[module]);
      return;
    }

    if (module === "subscribers") {
      const value = result.value as { total: number; confirmed: number };
      if (!isCount(value.total) || !isCount(value.confirmed)) {
        modules[module] = "unavailable";
        degradedCodes.push(degradedCodeByModule[module]);
        return;
      }
      counts.subscribers = value.total;
      counts.confirmedSubscribers = value.confirmed;
    } else if (isCount(result.value)) {
      counts[module] = result.value;
    } else {
      modules[module] = "unavailable";
      degradedCodes.push(degradedCodeByModule[module]);
      return;
    }
    modules[module] = "available";
  });

  return {
    ok: true,
    counts,
    health: {
      status: degradedCodes.length === 0 ? "healthy" : "degraded",
      modules,
    },
    degradedCodes,
  };
}

export function isDashboardSummaryResponse(
  value: unknown,
): value is DashboardSummaryResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DashboardSummaryResponse>;
  if (candidate.ok !== true || !candidate.counts || !candidate.health) return false;
  if (!dashboardModuleNames.every((name) =>
    candidate.health?.modules?.[name] === "available" ||
    candidate.health?.modules?.[name] === "unavailable")) return false;
  if (!(["healthy", "degraded"] as const).includes(candidate.health.status)) return false;
  if (!Array.isArray(candidate.degradedCodes)) return false;
  return ([...dashboardModuleNames, "confirmedSubscribers"] as const).every(
    (name) => candidate.counts?.[name] === null || isCount(candidate.counts?.[name]),
  );
}
