import { count, eq } from "drizzle-orm";
import { getDb, getRuntimeEnv } from "@/db";
import {
  comparisons,
  fieldTests,
  products,
  subscribers,
} from "@/db/gearswipe-schema";
import {
  createDashboardSummaryHandler,
  loadDashboardSummary,
} from "@/lib/admin-dashboard";
import { requireOperator } from "@/lib/operator-auth";

export const dynamic = "force-dynamic";

const countRows = async (query: PromiseLike<Array<{ value: number }>>) =>
  Number((await query)[0]?.value ?? 0);

const loadFromDatabase = () => {
  const db = getDb();
  return loadDashboardSummary({
    fieldTests: () => countRows(db.select({ value: count() }).from(fieldTests)),
    products: () => countRows(db.select({ value: count() }).from(products)),
    comparisons: () => countRows(db.select({ value: count() }).from(comparisons)),
    subscribers: async () => {
      const [total, confirmed] = await Promise.all([
        countRows(db.select({ value: count() }).from(subscribers)),
        countRows(
          db
            .select({ value: count() })
            .from(subscribers)
            .where(eq(subscribers.confirmed, true)),
        ),
      ]);
      return { total, confirmed };
    },
  });
};

export const GET = createDashboardSummaryHandler({
  authorize: requireOperator,
  hasDatabase: () => Boolean(getRuntimeEnv()?.DB),
  load: loadFromDatabase,
});
