import SuperAdminUsersTable from "@/components/superadmin/SuperAdminUsersTable";
export default function DeletedSuspendedPage() {
  return (
    <div className="space-y-10">
      <SuperAdminUsersTable
        title="Suspended Accounts"
        statusFilter="suspended"
        allowCreate={false}
      />
      <SuperAdminUsersTable
        title="Deleted Accounts"
        statusFilter="deleted"
        allowCreate={false}
      />
    </div>
  );
}
