import mongoose from 'mongoose';
import { Inventory, Reservation, StockMovement } from '../models/index.js';

export async function reserveInventory({ variantId, warehouseId, qty, orderId, session, ttlMinutes = 20 }) {
  const updated = await Inventory.findOneAndUpdate({ variantId, warehouseId, available: { $gte: qty } }, { $inc: { available: -qty, reserved: qty } }, { new: true, session });
  if (!updated) throw new Error('One or more items are no longer available in the requested quantity.');
  const expiresAt = new Date(Date.now() + ttlMinutes * 60000);
  const [reservation] = await Reservation.create([{ variantId, warehouseId, qty, orderId, expiresAt, status: 'active' }], { session });
  await StockMovement.create([{ variantId, warehouseId, orderId, kind: 'reserve', quantity: -qty, reference: `reservation:${reservation._id}` }], { session });
  return reservation;
}

export async function releaseExpiredReservations(now = new Date()) {
  const candidates = await Reservation.find({ status: 'active', expiresAt: { $lte: now } }).select('_id').lean();
  let released = 0;
  for (const candidate of candidates) {
    const session = await mongoose.startSession();
    let didRelease = false;
    try {
      await session.withTransaction(async () => {
        const reservation = await Reservation.findOneAndUpdate(
          { _id: candidate._id, status: 'active', expiresAt: { $lte: now } },
          { $set: { status: 'released', purgeAt: new Date(Date.now() + 7 * 86400000) } },
          { new: true, session }
        );
        if (!reservation) return;
        const stock = await Inventory.updateOne(
          { variantId: reservation.variantId, warehouseId: reservation.warehouseId, reserved: { $gte: reservation.qty } },
          { $inc: { available: reservation.qty, reserved: -reservation.qty } },
          { session }
        );
        if (!stock.matchedCount) throw new Error(`Reserved inventory is inconsistent for reservation ${reservation._id}.`);
        await StockMovement.create([{ variantId: reservation.variantId, warehouseId: reservation.warehouseId, orderId: reservation.orderId, kind: 'release', quantity: reservation.qty, reference: `expiry:${reservation._id}` }], { session });
        didRelease = true;
      });
    } finally {
      await session.endSession();
    }
    if (didRelease) released += 1;
  }
  return released;
}
