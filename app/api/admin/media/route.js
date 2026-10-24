import { connectDB } from '@/lib/db';
import { Media, Product } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { saveProductImageLocally, deleteProductMediaFiles } from '@/lib/storage';

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export async function GET(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  try {
    await connectDB();
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(60, Math.max(10, Number(url.searchParams.get('limit') || 30)));

    const [items, total] = await Promise.all([
      Media.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Media.countDocuments()
    ]);

    return ok(items, 200, { page, limit, total });
  } catch (error) {
    return fail(error.message, 500);
  }
}

export async function POST(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'marketing']));
  if (!actor) return fail('Admin permission required.', 403);

  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  if (!rateLimit(`admin-media-upload:${actor.sub || ip}`, { limit: 60, windowMs: 60000 }).allowed) {
    return fail('Too many media uploads. Please wait a moment.', 429);
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('file');
    const alt = (formData.get('alt') || '').trim();
    let productName = (formData.get('productName') || formData.get('name') || '').trim();
    const productId = formData.get('productId') || null;

    if (!files || files.length === 0) {
      return fail('No files uploaded.', 400);
    }

    await connectDB();

    if (!productName && productId) {
      const prod = await Product.findById(productId).select('name').lean();
      if (prod?.name) productName = prod.name;
    }

    const savedRecords = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!(file instanceof Blob)) continue;

      if (file.size > MAX_FILE_SIZE) {
        return fail(`File ${file.name || 'image'} exceeds the 8MB limit.`, 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Generate SEO-friendly image with Product Name
      const viewSuffix = files.length > 1 ? ` - View ${i + 1}` : '';
      const finalAlt = alt || (productName ? `${productName}${viewSuffix}` : file.name || 'Product Image');

      const imageResult = await saveProductImageLocally({
        buffer,
        alt: finalAlt,
        productName: productName || alt || file.name
      });

      const mediaDoc = await Media.create({
        url: imageResult.url,
        thumbUrl: imageResult.thumbUrl,
        blurDataURL: imageResult.blurDataURL,
        width: imageResult.width,
        height: imageResult.height,
        bytes: imageResult.bytes,
        mime: imageResult.mime,
        alt: imageResult.alt,
        storage: 'local',
        path: imageResult.path,
        uploadedBy: actor.sub,
        productId: productId || undefined,
        sizes: imageResult.sizes
      });

      savedRecords.push(mediaDoc);
    }

    return ok(savedRecords.length === 1 ? savedRecords[0] : savedRecords, 201);
  } catch (error) {
    console.error('Media upload error:', error);
    return fail(error.message, 400);
  }
}

export async function DELETE(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin']));
  if (!actor) return fail('Admin permission required.', 403);

  const url = new URL(request.url);
  const mediaId = url.searchParams.get('id');
  if (!mediaId) return fail('Media ID is required.', 400);

  try {
    await connectDB();
    const media = await Media.findById(mediaId);
    if (!media) return fail('Media not found.', 404);

    // Check if any product references this media
    const inUse = await Product.exists({
      $or: [
        { 'gallery.url': media.url },
        { image: media.url },
        { 'gallery.mediaId': media._id }
      ]
    });

    if (inUse) {
      return fail('Cannot delete media that is currently linked to a product.', 409);
    }

    // Delete local files
    if (media.path) {
      await deleteProductMediaFiles(media.path);
    }

    await Media.findByIdAndDelete(mediaId);
    return ok({ message: 'Media removed successfully.' });
  } catch (error) {
    return fail(error.message, 500);
  }
}
