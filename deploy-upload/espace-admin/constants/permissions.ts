// Role-based permissions config for MediFollow
// Add or update permissions as needed

export type AppPermission =
  | "view_users"
  | "edit_users"
  | "delete_users"
  | "assign_roles"
  | "manage_services"
  | "manage_questionnaires"
  | "view_alerts"
  | "configure_alerts"
  | "export_data"
  | "view_dashboard";

export const rolePermissions: Record<string, AppPermission[]> = {
  ADMIN: [
    "view_users",
    "edit_users",
    "delete_users",
    "assign_roles",
    "manage_services",
    "manage_questionnaires",
    "view_alerts",
    "configure_alerts",
    "export_data",
    "view_dashboard",
  ],
  DOCTOR: [
    "view_users",
    "view_alerts",
    "view_dashboard",
  ],
  NURSE: [
    "view_users",
    "view_alerts",
    "view_dashboard",
  ],
  COORDINATOR: [
    "view_users",
    "manage_services",
    "view_alerts",
    "view_dashboard",
  ],
  PATIENT: [
    "view_dashboard",
  ],
};

export function hasPermission(role: string, permission: AppPermission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
