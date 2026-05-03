import SuperAdminUsersTable from "@/components/superadmin/SuperAdminUsersTable";
export default function AdminsPage() {
  return <SuperAdminUsersTable title="Admins" roleFilter="ADMIN" createRole="ADMIN" />;
}
