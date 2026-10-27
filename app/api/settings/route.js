import { getLiveSiteConfig } from '@/lib/server-config';
import { ok, apiError } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getLiveSiteConfig();
    return ok(config);
  } catch (error) {
    return apiError(error);
  }
}
