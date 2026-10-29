import fs from 'fs';
import path from 'path';
import { getUploadRootDir } from '@/lib/storage';

const MIME_MAP = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml'
};

export async function GET(request, { params }) {
  const { path: pathSegments } = await params;
  if (!pathSegments || !Array.isArray(pathSegments) || pathSegments.length === 0) {
    return new Response('File not found', { status: 404 });
  }

  // Traversal protection
  for (const seg of pathSegments) {
    if (seg.includes('..') || seg.includes('/') || seg.includes('\\') || seg.includes('\0')) {
      return new Response('Access denied', { status: 403 });
    }
  }

  const rootDir = getUploadRootDir();
  const safeRelPath = pathSegments.join(path.sep);
  const fullPath = path.resolve(rootDir, safeRelPath);

  // Enforce root boundary
  if (!fullPath.startsWith(rootDir)) {
    return new Response('Access denied', { status: 403 });
  }

  try {
    let targetPath = fullPath;
    let stats;
    try {
      stats = await fs.promises.stat(targetPath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Fallback 1: variant requested (e.g. -large.webp), but only base .webp exists
        const baseVariant = targetPath.replace(/-(thumb|medium|large|original)\.webp$/i, '.webp');
        if (baseVariant !== targetPath) {
          try {
            stats = await fs.promises.stat(baseVariant);
            targetPath = baseVariant;
          } catch {
            return new Response('File not found', { status: 404 });
          }
        } else {
          // Fallback 2: base .webp requested, but legacy -large.webp exists
          const legacyVariant = targetPath.replace(/\.webp$/i, '-large.webp');
          try {
            stats = await fs.promises.stat(legacyVariant);
            targetPath = legacyVariant;
          } catch {
            return new Response('File not found', { status: 404 });
          }
        }
      } else {
        throw err;
      }
    }

    if (!stats.isFile()) {
      return new Response('File not found', { status: 404 });
    }

    const etag = `"${stats.mtimeMs.toString(36)}-${stats.size.toString(36)}"`;
    const clientEtag = request.headers.get('if-none-match');
    if (clientEtag && clientEtag === etag) {
      return new Response(null, { status: 304 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    const fileBuffer = await fs.promises.readFile(targetPath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(stats.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        ETag: etag
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return new Response('File not found', { status: 404 });
    }
    return new Response('Error retrieving file', { status: 500 });
  }
}
