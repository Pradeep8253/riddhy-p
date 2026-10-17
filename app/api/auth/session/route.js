import { getSession } from '@/lib/auth';
import { ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return ok({ authenticated: false, user: null });
    }
    return ok({
      authenticated: true,
      user: {
        id: session.sub,
        email: session.email,
        role: session.role || 'customer',
        name: session.name || null
      }
    });
  } catch {
    return ok({ authenticated: false, user: null });
  }
}
