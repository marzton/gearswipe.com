export const mailWorkspaces = ["Gearswipe", "Gold Shore"] as const;

export type MailWorkspace = (typeof mailWorkspaces)[number];

export type MailFormType = "contact" | "subscribe" | "auth" | "support" | "quote";

export type MailRoute = {
  workspace: MailWorkspace;
  formType: MailFormType;
  alias: string;
  from: string;
  to: string[];
  cc: string[];
  subjectPrefix: string;
  notes: string;
};

const routes: MailRoute[] = [
  {
    workspace: "Gearswipe",
    formType: "contact",
    alias: "support@gearswipe.com",
    from: "no-reply@gearswipe.com",
    to: ["support@gearswipe.com", "ops@gearswipe.com"],
    cc: ["rmarston@rmarston.com"],
    subjectPrefix: "[Gearswipe contact]",
    notes: "Primary buyer and support intake for the storefront.",
  },
  {
    workspace: "Gearswipe",
    formType: "subscribe",
    alias: "updates@gearswipe.com",
    from: "no-reply@gearswipe.com",
    to: ["updates@gearswipe.com"],
    cc: [],
    subjectPrefix: "[Gearswipe subscribe]",
    notes: "Catalog and launch updates.",
  },
  {
    workspace: "Gearswipe",
    formType: "auth",
    alias: "access@gearswipe.com",
    from: "no-reply@gearswipe.com",
    to: ["access@gearswipe.com", "admin@gearswipe.com"],
    cc: [],
    subjectPrefix: "[Gearswipe access]",
    notes: "Login and IDP support requests.",
  },
  {
    workspace: "Gearswipe",
    formType: "support",
    alias: "orders@gearswipe.com",
    from: "no-reply@gearswipe.com",
    to: ["orders@gearswipe.com", "ops@gearswipe.com"],
    cc: ["rmarston@rmarston.com"],
    subjectPrefix: "[Gearswipe support]",
    notes: "Cart checkout requests and purchase follow-up.",
  },
  {
    workspace: "Gearswipe",
    formType: "quote",
    alias: "quotes@gearswipe.com",
    from: "no-reply@gearswipe.com",
    to: ["quotes@gearswipe.com", "ops@gearswipe.com"],
    cc: ["rmarston@rmarston.com"],
    subjectPrefix: "[Gearswipe quote]",
    notes: "Custom build and configured product quote requests.",
  },
  {
    workspace: "Gold Shore",
    formType: "contact",
    alias: "contact@goldshore.ai",
    from: "no-reply@goldshore.ai",
    to: ["contact@goldshore.ai", "ops@goldshore.ai"],
    cc: ["support@rmarston.com"],
    subjectPrefix: "[Gold Shore contact]",
    notes: "Work, contracts, and project intake.",
  },
  {
    workspace: "Gold Shore",
    formType: "subscribe",
    alias: "newsletter@goldshore.ai",
    from: "no-reply@goldshore.ai",
    to: ["newsletter@goldshore.ai"],
    cc: [],
    subjectPrefix: "[Gold Shore subscribe]",
    notes: "Updates and announcements.",
  },
  {
    workspace: "Gold Shore",
    formType: "auth",
    alias: "admin@goldshore.ai",
    from: "no-reply@goldshore.ai",
    to: ["admin@goldshore.ai", "ops@goldshore.ai"],
    cc: [],
    subjectPrefix: "[Gold Shore access]",
    notes: "Identity, admin, and login support.",
  },
  {
    workspace: "Gold Shore",
    formType: "support",
    alias: "orders@goldshore.ai",
    from: "no-reply@goldshore.ai",
    to: ["orders@goldshore.ai", "ops@goldshore.ai"],
    cc: ["support@rmarston.com"],
    subjectPrefix: "[Gold Shore support]",
    notes: "Purchase follow-up and operational support.",
  },
];

export function resolveMailRoute(
  workspace: MailWorkspace,
  formType: MailFormType,
): MailRoute {
  return (
    routes.find(
      (route) => route.workspace === workspace && route.formType === formType,
    ) ?? routes[0]
  );
}

export function listMailRoutes(workspace?: MailWorkspace) {
  return workspace
    ? routes.filter((route) => route.workspace === workspace)
    : routes;
}

export function mailRouteSummary(route: MailRoute) {
  return {
    workspace: route.workspace,
    formType: route.formType,
    alias: route.alias,
    routedTo: route.to.join(", "),
    cc: route.cc.join(", "),
    notes: route.notes,
  };
}
