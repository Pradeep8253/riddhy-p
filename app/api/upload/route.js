import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`upload:${ip}`, {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Too many upload attempts. Please try again later.",
          },
        },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: { message: "No file provided." } },
        { status: 400 },
      );
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Invalid file type. Allowed formats: JPG, PNG, WEBP, GIF, PDF.",
          },
        },
        { status: 400 },
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "File too large. Maximum allowed size is 10MB." },
        },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const rawName = (formData.get("productName") || formData.get("name") || formData.get("alt") || "").toString().trim();
    const cleanBase = rawName
      ? rawName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60)
      : path.parse(file.name).name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);

    const basePrefix = cleanBase || "product";
    const randomHex = crypto.randomBytes(4).toString("hex");

    // Check if local storage is explicitly requested or Cloudinary is not configured
    const storageParam =
      formData.get("storage") || request.nextUrl.searchParams.get("storage");
    const forceLocal =
      storageParam === "local" || process.env.UPLOAD_STORAGE === "local";

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!forceLocal && cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });

      const folder = (formData.get("folder") || "rf-riddhy/customer-uploads").toString().trim();
      const publicId = `${basePrefix}-${randomHex}`;

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            resource_type: file.type.startsWith("image/") ? "image" : "raw",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          thumbUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          bytes: file.size,
          name: file.name,
          alt: rawName || file.name,
        },
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        bytes: file.size,
        name: file.name,
        alt: rawName || file.name,
      });
    }

    // Local fallback: write to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext =
      path.extname(file.name) ||
      (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").toLowerCase();
    const safeFilename = `${basePrefix}-${randomHex}${safeExt}`;
    const filePath = path.join(uploadsDir, safeFilename);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        thumbUrl: fileUrl,
        bytes: file.size,
        name: file.name,
        alt: rawName || file.name,
      },
      url: fileUrl,
      bytes: file.size,
      name: file.name,
      alt: rawName || file.name,
    });
  } catch (err) {
    console.error("File upload error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to process file upload." } },
      { status: 500 },
    );
  }
}
