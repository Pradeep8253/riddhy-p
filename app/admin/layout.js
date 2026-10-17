import { getSession } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }) {
  const session = await getSession();
  const isAdmin =
    session &&
    ['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance'].includes(session.role);

  return <AdminShell session={isAdmin ? session : null}>{children}</AdminShell>;
}
