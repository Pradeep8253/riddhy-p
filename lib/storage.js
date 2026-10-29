import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

// Magic bytes validation
export function detectImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF ... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  // AVIF: ....ftypavif or ....ftypavis
  const ftyp = buffer.subarray(4, 12).toString("ascii");
  if (ftyp === "ftypavif" || ftyp === "ftypavis") {
    return "image/avif";
  }

  return null;
}

export function getUploadRootDir() {
  const custom = process.env.UPLOAD_DIR;
  if (custom) {
    return path.isAbsolute(custom)
      ? custom
      : path.resolve(/*turbopackIgnore: true*/ process.cwd(), custom);
  }
  return path.resolve(
    /*turbopackIgnore: true*/ process.cwd(),
    "storage",
    "uploads",
  );
}

export function toSeoSlug(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Process and save product image with responsive sizes + blur placeholder
 */
export async function saveProductImageLocally({
  buffer,
  alt = "",
  productName = "",
}) {
  const mime = detectImageMagicBytes(buffer);
  if (!mime) {
    throw new Error(
      "Unsupported image format. Only JPG, PNG, WebP, and AVIF are permitted.",
    );
  }

  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const baseName = toSeoSlug(productName || alt) || "product";
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const fileId = `${baseName}-${randomSuffix}`;
  const resolvedAlt = alt || productName || "Product Image";

  const relSubdir = path.join("products", year, month);
  const targetDir = path.join(getUploadRootDir(), relSubdir);
  await fs.promises.mkdir(targetDir, { recursive: true });

  // 1. Process original
  const pipeline = sharp(buffer).rotate(); // auto-rotate according to EXIF orientation

  const meta = await pipeline.metadata();

  // 2. Generate exactly ONE optimized WebP file and an in-memory blur placeholder
  const [imageBuf, blurBuf] = await Promise.all([
    sharp(buffer)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer(),
    // tiny blur: 16px base64 data URL (in-memory only, no file saved to disk)
    sharp(buffer)
      .rotate()
      .resize({ width: 16, height: 16, fit: "inside" })
      .webp({ quality: 40 })
      .toBuffer(),
  ]);

  const filename = `${fileId}.webp`;
  await fs.promises.writeFile(path.join(targetDir, filename), imageBuf);

  const blurDataURL = `data:image/webp;base64,${blurBuf.toString("base64")}`;

  const baseRelUrl = `/api/files/products/${year}/${month}`;
  const fileUrl = `${baseRelUrl}/${filename}`;

  return {
    url: fileUrl,
    thumbUrl: fileUrl,
    mediumUrl: fileUrl,
    largeUrl: fileUrl,
    originalUrl: fileUrl,
    blurDataURL,
    width: meta.width || 1200,
    height: meta.height || 1200,
    bytes: imageBuf.length,
    mime: "image/webp",
    alt: resolvedAlt,
    path: path.join(relSubdir, filename),
    sizes: {
      thumb: fileUrl,
      medium: fileUrl,
      large: fileUrl,
      original: fileUrl,
    },
  };
}

/**
 * Remove local product media files
 */
export async function deleteProductMediaFiles(relPath) {
  if (!relPath) return;
  const rootDir = getUploadRootDir();
  const fullPath = path.resolve(rootDir, relPath);
  if (!fullPath.startsWith(rootDir)) return; // prevent traversal

  const dir = path.dirname(fullPath);
  const basePrefix = path
    .basename(fullPath)
    .replace(/-(thumb|medium|large|original)\.webp$/i, "")
    .replace(/\.[a-zA-Z0-9]+$/, "");

  try {
    const files = await fs.promises.readdir(dir);
    for (const f of files) {
      if (f.startsWith(basePrefix)) {
        await fs.promises.unlink(path.join(dir, f)).catch(() => {});
      }
    }
  } catch {
    // Ignore if directory or files not found
  }
}
