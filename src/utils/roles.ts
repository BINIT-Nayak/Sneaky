export const normalizeRole = (role?: string | null) =>
  role?.trim().replace(/^ROLE_/i, "").toUpperCase() ?? "";

export const isAdminRole = (role?: string | null) =>
  normalizeRole(role) === "ADMIN";
