import { cache } from 'react';
import { getPublicServerClient } from '@/lib/supabase';

export const getAdminAccessState = cache(async () => {
  const supabase = await getPublicServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false, user: null };
  }

  const { count, error } = await supabase
    .from('admin_users')
    .select('user_id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return { isAdmin: Boolean(count), user };
});
