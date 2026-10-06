import { auth } from "@/lib/access-auth";

export type OperatorIdentity = { email: string };

/** Route-level protection remains effective even if deployment middleware is omitted. */
export async function requireOperator(): Promise<OperatorIdentity | Response> {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { email: session.user.email };
}
