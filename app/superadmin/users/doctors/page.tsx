import SuperAdminUsersTable from "@/components/superadmin/SuperAdminUsersTable";
export default function DoctorsPage() {
  return <SuperAdminUsersTable title="Doctors" roleFilter="DOCTOR" createRole="DOCTOR" />;
}
