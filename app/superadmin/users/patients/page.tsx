import SuperAdminUsersTable from "@/components/superadmin/SuperAdminUsersTable";
export default function PatientsPage() {
  return <SuperAdminUsersTable title="Patients" roleFilter="PATIENT" createRole="PATIENT" />;
}
