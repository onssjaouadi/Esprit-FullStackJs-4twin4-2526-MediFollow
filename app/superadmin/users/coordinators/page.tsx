import SuperAdminUsersTable from "@/components/superadmin/SuperAdminUsersTable";
export default function CoordinatorsPage() {
  return <SuperAdminUsersTable title="Coordinators" roleFilter="COORDINATOR" createRole="COORDINATOR" />;
}
