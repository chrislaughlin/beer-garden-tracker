import { trustedAdminUserIds } from '@/lib/data/demo-data';

export function isTrustedAdmin(userId?: string | null) {
  return Boolean(userId && trustedAdminUserIds.includes(userId));
}
