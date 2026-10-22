import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import {
  Product,
  Variant,
  Category,
  Brand,
  Warehouse,
  Inventory,
  StockMovement,
  AuditLog,
} from "@/models/index";
import { requireAdmin } from "@/lib/roles";
import { ok, fail, jsonBody } from "@/lib/http";
import { revalidateTag } from "next/cache";
import { getCompanySettings } from "@/lib/company-settings";

const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(2).max(160),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    sku: z
      .string()
      .trim()
      .regex(/^[A-Z0-9-]{3,40}$/),
    type: z.enum(["furniture", "appliance"]),
    modelType: z.string().max(40).optional(),
    category: z.string().min(2),
    brand: z.string().min(1).default("RF Riddhy"),
    price: z.number().positive(),
    mrp: z.number().positive(),
    discount: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0).max(100000).default(0),
    image: z.string().optional(),
    gallery: z
      .array(
        z.object({
          mediaId: z.string().optional(),
          url: z.string().min(1),
          thumbUrl: z.string().optional(),
          blurDataURL: z.string().optional(),
          alt: z.string().optional(),
          sortOrder: z.number().optional(),
        }),
      )
      .optional(),
    tags: z
      .array(
        z.enum([
          "best-selling",
          "popular",
          "trending",
          "new-arrival",
          "featured",
          "deal",
          "limited",
        ]),
      )
      .optional(),
    tagOverrides: z
      .object({
        pin: z.array(z.string()).optional(),
        hide: z.array(z.string()).optional(),
      })
      .optional(),
    badgeText: z.string().max(40).optional(),
    hsnCode: z.string().max(10).optional(),
    description: z.string().max(8000).optional(),
    tagline: z.string().max(200).optional(),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    warranty: z.record(z.string(), z.unknown()).optional(),
    specs: z.record(z.string(), z.unknown()).optional(),
    dimensions: z.record(z.string(), z.unknown()).optional(),
    seo: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((data) => data.mrp >= data.price, {
    message: "MRP must be greater than or equal to selling price.",
    path: ["mrp"],
  });

const quickEditSchema = z
  .object({
    action: z.literal("quickEdit"),
    id: z.string().min(1),
    price: z.number().positive().optional(),
    mrp: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
  })
  .refine(
    (d) => {
      if (d.price && d.mrp) return d.mrp >= d.price;
      return true;
    },
    { message: "MRP must be >= price", path: ["mrp"] },
  );

const bulkActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("bulkStatus"),
    ids: z.array(z.string().min(1)).min(1),
    status: z.enum(["draft", "active", "archived"]),
  }),
  z.object({
    action: z.literal("bulkAddTag"),
    ids: z.array(z.string().min(1)).min(1),
    tag: z.enum([
      "best-selling",
      "popular",
      "trending",
      "new-arrival",
      "featured",
      "deal",
      "limited",
    ]),
  }),
  z.object({
    action: z.literal("bulkRemoveTag"),
    ids: z.array(z.string().min(1)).min(1),
    tag: z.string().min(1),
  }),
  z.object({
    action: z.literal("bulkCategory"),
    ids: z.array(z.string().min(1)).min(1),
    category: z.string().min(1),
  }),
  z.object({
    action: z.literal("bulkArchive"),
    ids: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    action: z.literal("archive"),
    id: z.string().min(1),
  }),
]);

export async function GET(request) {
  const actor = await requireAdmin(
    new Set(["admin", "super-admin", "marketing", "warehouse", "finance"]),
  );
  if (!actor) return fail("Admin permission required.", 403);

  try {
    await connectDB();
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(10, Number(searchParams.get("limit") || 25)),
    );
    const q = (searchParams.get("q") || "").trim();
    const sortParam = searchParams.get("sort") || "updatedAt:desc";
    const [sortFieldRaw, sortDirRaw] = sortParam.split(":");
    const sortDir = sortDirRaw === "asc" ? 1 : -1;

    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const stockFilter = searchParams.get("stock"); // 'in' | 'low' | 'out'
    const tag = searchParams.get("tag");
    const priceMin = searchParams.get("priceMin")
      ? Number(searchParams.get("priceMin"))
      : null;
    const priceMax = searchParams.get("priceMax")
      ? Number(searchParams.get("priceMax"))
      : null;
    const hasImage = searchParams.get("hasImage");
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");

    // Build base MongoDB filter for Product
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }
    if (type && type !== "all") {
      filter.type = type;
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (brand && brand !== "all") {
      filter.brand = brand;
    }
    if (tag && tag !== "all") {
      filter.tags = tag;
    }
    if (priceMin !== null || priceMax !== null) {
      filter.price = {};
      if (priceMin !== null) filter.price.$gte = priceMin;
      if (priceMax !== null) filter.price.$lte = priceMax;
    }
    if (hasImage === "true") {
      filter.$or = [
        { image: { $exists: true, $ne: "" } },
        { "gallery.0": { $exists: true } },
      ];
    } else if (hasImage === "false") {
      filter.$and = [
        {
          $or: [{ image: { $exists: false } }, { image: "" }, { image: null }],
        },
        { "gallery.0": { $exists: false } },
      ];
    }

    if (createdFrom || createdTo) {
      filter.createdAt = {};
      if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
      if (createdTo) {
        const toD = new Date(createdTo);
        toD.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toD;
      }
    }

    // Search logic: name, slug, sku, brand, category, tags
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      const matchingVariants = await Variant.find(
        { sku: regex },
        { productId: 1 },
      ).lean();
      const matchedProductIds = matchingVariants.map((v) => v.productId);

      const searchConditions = [
        { name: regex },
        { slug: regex },
        { brand: regex },
        { category: regex },
        { categoryLabel: regex },
        { tags: regex },
      ];
      if (matchedProductIds.length > 0) {
        searchConditions.push({ _id: { $in: matchedProductIds } });
      }

      if (filter.$and) {
        filter.$and.push({ $or: searchConditions });
      } else if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // Determine sort stage
    let sortStage = { updatedAt: -1 };
    if (sortFieldRaw === "createdAt") sortStage = { createdAt: sortDir };
    else if (sortFieldRaw === "name") sortStage = { name: sortDir };
    else if (sortFieldRaw === "price") sortStage = { effectivePrice: sortDir };
    else if (sortFieldRaw === "stock") sortStage = { effectiveStock: sortDir };
    else if (sortFieldRaw === "sales30d") sortStage = { sales30d: sortDir };
    else sortStage = { updatedAt: sortDir };

    // Primary pipeline with lookup to variants
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "productId",
          as: "variants",
        },
      },
      {
        $addFields: {
          primaryVariant: { $arrayElemAt: ["$variants", 0] },
          sku: { $ifNull: [{ $arrayElemAt: ["$variants.sku", 0] }, ""] },
          effectivePrice: {
            $ifNull: [{ $arrayElemAt: ["$variants.price", 0] }, "$price"],
          },
          effectiveMrp: {
            $ifNull: [{ $arrayElemAt: ["$variants.mrp", 0] }, "$mrp"],
          },
          effectiveStock: {
            $ifNull: [{ $arrayElemAt: ["$variants.stock", 0] }, 0],
          },
          hsnCode: {
            $ifNull: [
              "$hsnCode",
              { $cond: [{ $eq: ["$type", "appliance"] }, "8516", "9403"] },
            ],
          },
        },
      },
    ];

    // Filter by stock bucket if selected
    if (stockFilter === "in") {
      pipeline.push({ $match: { effectiveStock: { $gt: 5 } } });
    } else if (stockFilter === "low") {
      pipeline.push({ $match: { effectiveStock: { $gt: 0, $lte: 5 } } });
    } else if (stockFilter === "out") {
      pipeline.push({ $match: { effectiveStock: { $lte: 0 } } });
    }

    // Facet stage for items + total count
    pipeline.push({
      $facet: {
        items: [
          { $sort: sortStage },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              variants: 0,
              primaryVariant: 0,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    // Execute query aggregation and facets aggregation concurrently
    const [mainResult, facetStats] = await Promise.all([
      Product.aggregate(pipeline),
      // Facets across the entire active catalogue
      Product.aggregate([
        {
          $lookup: {
            from: "variants",
            localField: "_id",
            foreignField: "productId",
            as: "variants",
          },
        },
        {
          $addFields: {
            effectiveStock: {
              $ifNull: [{ $arrayElemAt: ["$variants.stock", 0] }, 0],
            },
          },
        },
        {
          $facet: {
            statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
            categoryCounts: [
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            tagCounts: [
              { $unwind: { path: "$tags", preserveNullAndEmptyArrays: false } },
              { $group: { _id: "$tags", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            stockCounts: [
              {
                $group: {
                  _id: null,
                  in: {
                    $sum: { $cond: [{ $gt: ["$effectiveStock", 5] }, 1, 0] },
                  },
                  low: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gt: ["$effectiveStock", 0] },
                            { $lte: ["$effectiveStock", 5] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  out: {
                    $sum: { $cond: [{ $lte: ["$effectiveStock", 0] }, 1, 0] },
                  },
                },
              },
            ],
          },
        },
      ]),
    ]);

    const items = (mainResult[0]?.items || []).map((item) => ({
      ...item,
      id: String(item._id),
      price: item.effectivePrice ?? item.price,
      mrp: item.effectiveMrp ?? item.mrp,
      stock: item.effectiveStock ?? 0,
      tags: item.tags || [],
      gallery:
        item.gallery || (item.image ? [{ url: item.image, sortOrder: 0 }] : []),
    }));

    const total = mainResult[0]?.totalCount?.[0]?.count || 0;

    // Format facets dictionary
    const rawFacets = facetStats[0] || {};
    const statusMap = { all: 0, draft: 0, active: 0, archived: 0 };
    (rawFacets.statusCounts || []).forEach((s) => {
      if (s._id) statusMap[s._id] = s.count;
      statusMap.all += s.count;
    });

    const stockMap = rawFacets.stockCounts?.[0] || { in: 0, low: 0, out: 0 };
    delete stockMap._id;

    const facets = {
      status: statusMap,
      category: (rawFacets.categoryCounts || []).map((c) => ({
        id: c._id,
        count: c.count,
      })),
      tag: (rawFacets.tagCounts || []).map((t) => ({
        id: t._id,
        count: t.count,
      })),
      stock: stockMap,
    };

    return ok(items, 200, { page, limit, total, facets });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return fail(error.message, 500);
  }
}

export async function POST(request) {
  const actor = await requireAdmin(
    new Set(["admin", "super-admin", "marketing"]),
  );
  if (!actor) return fail("Admin permission required.", 403);

  const rawBody = await jsonBody(request);
  const parsed = productSchema.safeParse(rawBody);
  if (!parsed.success)
    return fail("Product details are invalid.", 400, parsed.error.flatten());

  let session;
  try {
    await connectDB();
    const data = parsed.data;
    session = await mongoose.startSession();
    let saved;

    await session.withTransaction(async () => {
      const category = await Category.findOne({
        slug: data.category,
        active: true,
      }).session(session);
      if (!category) throw new Error("Choose a valid active category.");
      if (category.type !== data.type)
        throw new Error("Category type must match product type.");

      const productBefore =
        data.id && mongoose.Types.ObjectId.isValid(data.id)
          ? await Product.findById(data.id).session(session)
          : await Product.findOne({ slug: data.slug }).session(session);

      const existingVariant = productBefore
        ? await Variant.findOne({ productId: productBefore._id })
            .sort({ createdAt: 1 })
            .session(session)
        : null;

      if (existingVariant && existingVariant.sku !== data.sku) {
        // Primary SKU cannot be renamed; retain the existing primary SKU
        data.sku = existingVariant.sku;
      }

      const skuConflict = await Variant.findOne({ sku: data.sku }).session(
        session,
      );
      if (
        skuConflict &&
        (!productBefore ||
          String(skuConflict.productId) !== String(productBefore._id))
      ) {
        throw new Error("That SKU is already assigned to a different product.");
      }

      const brand = await Brand.findOne({ name: data.brand }).session(session);

      // Primary image synchronization with gallery[0]
      const primaryImage =
        data.gallery && data.gallery.length > 0
          ? data.gallery[0].url
          : data.image || "";

      const productDoc = {
        ...data,
        image: primaryImage,
        gallery:
          data.gallery ||
          (primaryImage ? [{ url: primaryImage, sortOrder: 0 }] : []),
        tags: data.tags || [],
        tagOverrides: data.tagOverrides || { pin: [], hide: [] },
        badgeText: data.badgeText || "",
        hsnCode: data.hsnCode || (data.type === "appliance" ? "8516" : "9403"),
        modelType:
          data.modelType ||
          (data.type === "appliance" ? "refrigerator" : "sofa"),
        categoryId: category._id,
        brandId: brand?._id,
        categoryLabel: category.name,
        isDemo: false,
        isDemoImage: primaryImage ? primaryImage.startsWith("/images/") : true,
        archivedAt: data.status === "archived" ? new Date() : undefined,
      };

      const product = await Product.findOneAndUpdate(
        { slug: data.slug },
        { $set: productDoc },
        { upsert: true, new: true, setDefaultsOnInsert: true, session },
      );

      let variant;
      if (existingVariant) {
        existingVariant.sku = data.sku;
        existingVariant.productId = product._id;
        existingVariant.price = data.price;
        existingVariant.mrp = data.mrp;
        existingVariant.stock = data.stock;
        existingVariant.active = data.status === "active";
        await existingVariant.save({ session });
        variant = existingVariant;
      } else {
        variant = await Variant.findOneAndUpdate(
          { sku: data.sku },
          {
            $set: {
              productId: product._id,
              sku: data.sku,
              attributes: { finish: "Standard" },
              price: data.price,
              mrp: data.mrp,
              stock: data.stock,
              active: data.status === "active",
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true, session },
        );
      }

      const company = await getCompanySettings();
      const warehouseCode = company.defaultWarehouseCode || "DELHI-01";
      const warehouse = await Warehouse.findOneAndUpdate(
        { code: warehouseCode },
        {
          $setOnInsert: {
            code: warehouseCode,
            name: "Default fulfilment hub",
            active: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, session },
      );

      const oldInventory = await Inventory.findOne({
        variantId: variant._id,
        warehouseId: warehouse._id,
      }).session(session);
      const oldAvailable = oldInventory?.available || 0;

      await Inventory.findOneAndUpdate(
        { variantId: variant._id, warehouseId: warehouse._id },
        {
          $set: { available: data.stock, lowStockAt: 4 },
          $setOnInsert: {
            variantId: variant._id,
            warehouseId: warehouse._id,
            reserved: 0,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, session },
      );

      if (!oldInventory && data.stock > 0) {
        await StockMovement.create(
          [
            {
              variantId: variant._id,
              warehouseId: warehouse._id,
              kind: "opening",
              quantity: data.stock,
              reference: `admin-opening:${product.slug}`,
              actorId: actor.sub,
            },
          ],
          { session },
        );
      } else if (oldInventory && oldAvailable !== data.stock) {
        await StockMovement.create(
          [
            {
              variantId: variant._id,
              warehouseId: warehouse._id,
              kind: "adjustment",
              quantity: data.stock - oldAvailable,
              reference: `admin-adjustment:${product.slug}:${Date.now()}`,
              actorId: actor.sub,
            },
          ],
          { session },
        );
      }

      await AuditLog.create(
        [
          {
            actorId: actor.sub,
            actorEmail: actor.email,
            action: "product.upsert",
            entity: "Product",
            entityId: String(product._id),
            after: {
              name: product.name,
              status: product.status,
              sku: data.sku,
              stock: data.stock,
              price: data.price,
            },
          },
        ],
        { session },
      );

      saved = { id: String(product._id), slug: product.slug, sku: data.sku };
    });

    revalidateTag("catalogue", "max");
    return ok(saved, 201);
  } catch (error) {
    if (error.code === 11000)
      return fail("Product slug or SKU already exists.", 409);
    return fail(error.message, 400);
  } finally {
    await session?.endSession();
  }
}

export async function PATCH(request) {
  const actor = await requireAdmin(
    new Set(["admin", "super-admin", "marketing", "warehouse"]),
  );
  if (!actor) return fail("Admin permission required.", 403);

  const body = await jsonBody(request);
  if (!body) return fail("Payload is required.", 400);

  await connectDB();

  // 1. Quick edit (price, mrp, stock)
  if (body.action === "quickEdit") {
    const parsed = quickEditSchema.safeParse(body);
    if (!parsed.success)
      return fail("Invalid edit parameters.", 400, parsed.error.flatten());

    const { id, price, mrp, stock } = parsed.data;
    const product = await Product.findById(id);
    if (!product) return fail("Product not found.", 404);

    const updateFields = {};
    if (price !== undefined) updateFields.price = price;
    if (mrp !== undefined) updateFields.mrp = mrp;
    if (mrp && price) {
      updateFields.discount = Math.max(
        0,
        Math.round(((mrp - price) / mrp) * 100),
      );
    }

    await Product.findByIdAndUpdate(id, { $set: updateFields });

    // Update primary variant
    const variant = await Variant.findOne({ productId: product._id }).sort({
      createdAt: 1,
    });
    if (variant) {
      if (price !== undefined) variant.price = price;
      if (mrp !== undefined) variant.mrp = mrp;
      if (stock !== undefined) variant.stock = stock;
      await variant.save();

      if (stock !== undefined) {
        const company = await getCompanySettings();
        const warehouseCode = company.defaultWarehouseCode || "DELHI-01";
        const warehouse = await Warehouse.findOne({ code: warehouseCode });
        if (warehouse) {
          const oldInv = await Inventory.findOne({
            variantId: variant._id,
            warehouseId: warehouse._id,
          });
          const oldStock = oldInv?.available || 0;
          await Inventory.findOneAndUpdate(
            { variantId: variant._id, warehouseId: warehouse._id },
            { $set: { available: stock } },
            { upsert: true },
          );
          if (oldStock !== stock) {
            await StockMovement.create({
              variantId: variant._id,
              warehouseId: warehouse._id,
              kind: "adjustment",
              quantity: stock - oldStock,
              reference: `admin-quickedit:${product.slug}`,
              actorId: actor.sub,
            });
          }
        }
      }
    }

    await AuditLog.create({
      actorId: actor.sub,
      actorEmail: actor.email,
      action: "product.quick_edit",
      entity: "Product",
      entityId: String(product._id),
      after: { price, mrp, stock },
    });

    revalidateTag("catalogue", "max");
    return ok({ id, price, mrp, stock, message: "Updated successfully." });
  }

  // 2. Bulk Actions
  const parsedBulk = bulkActionSchema.safeParse(body);
  if (!parsedBulk.success)
    return fail("Invalid bulk action.", 400, parsedBulk.error.flatten());

  const data = parsedBulk.data;

  if (data.action === "bulkStatus") {
    const update = { status: data.status };
    if (data.status === "archived") update.archivedAt = new Date();
    await Product.updateMany({ _id: { $in: data.ids } }, { $set: update });
    if (data.status === "active" || data.status === "archived") {
      await Variant.updateMany(
        { productId: { $in: data.ids } },
        { $set: { active: data.status === "active" } },
      );
    }
  } else if (data.action === "bulkAddTag") {
    await Product.updateMany(
      { _id: { $in: data.ids } },
      { $addToSet: { tags: data.tag } },
    );
  } else if (data.action === "bulkRemoveTag") {
    await Product.updateMany(
      { _id: { $in: data.ids } },
      { $pull: { tags: data.tag } },
    );
  } else if (data.action === "bulkCategory") {
    const cat = await Category.findOne({ slug: data.category });
    if (!cat) return fail("Category not found.", 404);
    await Product.updateMany(
      { _id: { $in: data.ids } },
      { $set: { category: cat.slug, categoryLabel: cat.name, type: cat.type } },
    );
  } else if (data.action === "bulkArchive") {
    await Product.updateMany(
      { _id: { $in: data.ids } },
      { $set: { status: "archived", archivedAt: new Date() } },
    );
    await Variant.updateMany(
      { productId: { $in: data.ids } },
      { $set: { active: false } },
    );
  } else if (data.action === "archive") {
    await Product.findByIdAndUpdate(data.id, {
      $set: { status: "archived", archivedAt: new Date() },
    });
    await Variant.updateMany(
      { productId: data.id },
      { $set: { active: false } },
    );
  }

  await AuditLog.create({
    actorId: actor.sub,
    actorEmail: actor.email,
    action: `product.${data.action}`,
    entity: "Product",
    after: { action: data.action, count: data.ids?.length || 1 },
  });

  revalidateTag("catalogue", "max");
  return ok({ action: data.action, count: data.ids?.length || 1 });
}
