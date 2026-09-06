import { requireAdminAuth } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminAuth("/admin");
  return children;
}
