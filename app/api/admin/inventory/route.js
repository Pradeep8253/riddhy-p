import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Inventory, Variant, Product, Warehouse, StockMovement, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';

const schema = z.object({
  sku: z.string().min(3),
  warehouseCode: z.string().min(2).default('DELHI-01'),
  available: z.number().int().min(0).max(100000).optional(),
  action: z.enum(['set', 'in', 'out']).default('set'),
  quantity: z.number().int().min(1).max(10000).optional(),
  reason: z.string().min(2).max(300).default('Inventory update')
});

export async function GET() {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'warehouse']));
  if (!actor) return fail('Inventory permission required.', 403);

  try {
    await connectDB();
    const rows = await Inventory.find().sort({ updatedAt: -1 }).limit(500).lean();

    if (!rows.length) {
      return ok([]);
    }

    const variantIds = [...new Set(rows.map((row) => String(row.variantId)))];
    const warehouseIds = [...new Set(rows.map((row) => String(row.warehouseId)))];

    const [variants, warehouses] = await Promise.all([
      Variant.find({ _id: { $in: variantIds } }).lean(),
      Warehouse.find({ _id: { $in: warehouseIds } }).lean()
    ]);

    const productIds = [...new Set(variants.map((row) => String(row.productId)))];
    const products = await Product.find({ _id: { $in: productIds } }).select('name slug').lean();

    const variantMap = new Map(variants.map((row) => [String(row._id), row]));
    const warehouseMap = new Map(warehouses.map((row) => [String(row._id), row]));
    const productMap = new Map(products.map((row) => [String(row._id), row]));

    return ok(
      rows.map((row) => {
        const variant = variantMap.get(String(row.variantId));
        const product = variant && productMap.get(String(variant.productId));
        const warehouse = warehouseMap.get(String(row.warehouseId));
        return {
          id: String(row._id),
          sku: variant?.sku || 'Unknown SKU',
          product: product?.name || 'Unknown product',
          slug: product?.slug,
          warehouseCode: warehouse?.code || 'DELHI-01',
          available: row.available,
          reserved: row.reserved,
          lowStockAt: row.lowStockAt,
          updatedAt: row.updatedAt,
          lowStock: row.available <= row.lowStockAt
        };
      })
    );
  } catch (error) {
    return fail(error.message || 'Unable to retrieve inventory.', 500);
  }
}

export async function PATCH(request) {
  const actor = await requireAdmin(new Set(['admin', 'super-admin', 'warehouse']));
  if (!actor) return fail('Inventory permission required.', 403);

  const parsed = schema.safeParse(await jsonBody(request));
  if (!parsed.success) return fail('Stock adjustment is invalid.', 400, parsed.error.flatten());

  const { sku, warehouseCode, action, quantity = 1, available, reason } = parsed.data;

  let session;
  try {
    await connectDB();
    session = await mongoose.startSession();
    let result;

    await session.withTransaction(async () => {
      const variant = await Variant.findOne({ sku }).session(session);
      if (!variant) throw new Error('SKU not found in database.');

      const warehouse = await Warehouse.findOne({ code: warehouseCode, active: true }).session(session);
      if (!warehouse) throw new Error('Active warehouse not found.');

      let inventory = await Inventory.findOne({ variantId: variant._id, warehouseId: warehouse._id }).session(session);
      if (!inventory) {
        inventory = new Inventory({
          variantId: variant._id,
          warehouseId: warehouse._id,
          available: 0,
          reserved: 0,
          lowStockAt: 5
        });
      }

      let targetAvailable = inventory.available;
      let movementKind = 'adjustment';

      if (action === 'in') {
        targetAvailable = inventory.available + quantity;
        movementKind = 'purchase';
      } else if (action === 'out') {
        if (inventory.available < quantity) {
          throw new Error(`Insufficient stock. Current available: ${inventory.available}`);
        }
        targetAvailable = Math.max(0, inventory.available - quantity);
        movementKind = 'damage';
      } else {
        targetAvailable = available !== undefined ? available : inventory.available;
      }

      const delta = targetAvailable - inventory.available;
      inventory.available = targetAvailable;
      await inventory.save({ session });

      // Automatically keep Product.stock and Variant.stock in sync with frontend catalog
      await Variant.updateOne(
        { _id: variant._id },
        { $set: { stock: targetAvailable } }
      ).session(session);

      if (variant.productId) {
        await Product.updateOne(
          { _id: variant.productId },
          { $set: { stock: targetAvailable } }
        ).session(session);
      }

      if (delta !== 0) {
        await StockMovement.create(
          [
            {
              variantId: variant._id,
              warehouseId: warehouse._id,
              kind: movementKind,
              quantity: delta,
              reference: `admin:${action}:${reason}`,
              actorId: actor.sub
            }
          ],
          { session }
        );

        await AuditLog.create(
          [
            {
              actorId: actor.sub,
              actorEmail: actor.email,
              action: `inventory.${action}`,
              entity: 'Inventory',
              entityId: String(inventory._id),
              before: { available: inventory.available - delta },
              after: { available: targetAvailable, reserved: inventory.reserved, reason }
            }
          ],
          { session }
        );
      }

      result = {
        sku: variant.sku,
        warehouseCode: warehouse.code,
        available: targetAvailable,
        reserved: inventory.reserved,
        delta
      };
    });

    return ok(result);
  } catch (error) {
    console.error('Inventory adjustment failed:', error.message);
    return fail(error.message || 'Unable to update inventory.', 400);
  } finally {
    await session?.endSession();
  }
}
