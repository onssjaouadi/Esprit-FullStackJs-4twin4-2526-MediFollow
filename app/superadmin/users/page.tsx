import SuperAdminUsersTable from "@/components/superadmin/SuperAdminUsersTable";

export default function AllUsersPage() {
  return <SuperAdminUsersTable title="All Users" roleFilter={undefined} allowCreate={false} />;
}
