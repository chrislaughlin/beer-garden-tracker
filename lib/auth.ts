const DEFAULT_ADMIN_IDS = ['admin-demo-user-id'];

export function getTrustedAdminUserIds() {
  return (process.env.ADMIN_ALLOWLIST_USER_IDS ?? DEFAULT_ADMIN_IDS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isTrustedAdmin(userId?: string | null) {
  return Boolean(userId && getTrustedAdminUserIds().includes(userId));
}
