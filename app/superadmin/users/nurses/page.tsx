import SuperAdminUsersTable from "@/components/superadmin/SuperAdminUsersTable";
export default function NursesPage() {
  return <SuperAdminUsersTable title="Nurses" roleFilter="NURSE" createRole="NURSE" />;
}
