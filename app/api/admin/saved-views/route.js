import { connectDB } from '@/lib/db';
import { AdminUser } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';

export async function GET(request) {
  const actor = await requireAdmin();
  if (!actor) return fail('Admin permission required.', 403);

  const url = new URL(request.url);
  const entity = url.searchParams.get('entity') || 'products';

  try {
    await connectDB();
    const user = await AdminUser.findById(actor.sub).lean();
    const customViews = (user?.savedViews || []).filter((v) => v.entity === entity);

    // Standard preset views
    const presetViews = [
      { id: 'all', name: 'All Products', entity: 'products', filters: {}, isPreset: true },
      { id: 'low_stock', name: 'Low Stock', entity: 'products', filters: { stock: 'low' }, isPreset: true },
      { id: 'drafts', name: 'Drafts', entity: 'products', filters: { status: 'draft' }, isPreset: true },
      { id: 'best_sellers', name: 'Best Sellers', entity: 'products', filters: { tag: 'best-selling' }, isPreset: true },
      { id: 'archived', name: 'Archived', entity: 'products', filters: { status: 'archived' }, isPreset: true }
    ];

    return ok([...presetViews, ...customViews]);
  } catch (error) {
    return fail(error.message, 500);
  }
}

export async function POST(request) {
  const actor = await requireAdmin();
  if (!actor) return fail('Admin permission required.', 403);

  const body = await jsonBody(request);
  if (!body || !body.name) return fail('View name is required.', 400);

  try {
    await connectDB();
    const newView = {
      name: body.name.trim(),
      entity: body.entity || 'products',
      filters: body.filters || {},
      sort: body.sort || 'updatedAt:desc',
      columns: body.columns || [],
      density: body.density || 'normal'
    };

    const user = await AdminUser.findByIdAndUpdate(
      actor.sub,
      { $push: { savedViews: newView } },
      { new: true }
    );

    return ok(user.savedViews);
  } catch (error) {
    return fail(error.message, 500);
  }
}

export async function DELETE(request) {
  const actor = await requireAdmin();
  if (!actor) return fail('Admin permission required.', 403);

  const url = new URL(request.url);
  const viewId = url.searchParams.get('id');
  if (!viewId) return fail('View ID is required.', 400);

  try {
    await connectDB();
    await AdminUser.findByIdAndUpdate(actor.sub, {
      $pull: { savedViews: { _id: viewId } }
    });
    return ok({ message: 'View removed successfully.' });
  } catch (error) {
    return fail(error.message, 500);
  }
}
