import { connectDB } from '@/lib/db';
import { Lead } from '@/models/index';
import { ok, fail } from '@/lib/http';
import { siteConfig } from '@/lib/site-config';
import { getLiveSiteConfig } from '@/lib/server-config';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');

    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return fail('Please provide a valid date parameter in YYYY-MM-DD format.', 400);
    }

    const slotDate = new Date(dateParam);
    const startOfDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate(), 23, 59, 59);

    const liveConfig = await getLiveSiteConfig();
    const maxCapacity = liveConfig.consultation.capacityPerSlot;
    const baseWindows = liveConfig.consultation.windows || siteConfig.consultation.windows;

    const counts = { morning: 0, afternoon: 0, evening: 0 };

    if (process.env.MONGODB_URI) {
      await connectDB();
      const bookings = await Lead.aggregate([
        {
          $match: {
            kind: 'consultation',
            preferredDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['new', 'in_progress', 'scheduled'] }
          }
        },
        {
          $group: {
            _id: '$timeWindow',
            count: { $sum: 1 }
          }
        }
      ]);

      for (const item of bookings) {
        if (counts[item._id] !== undefined) {
          counts[item._id] = item.count;
        }
      }
    }

    const windows = baseWindows.map((win) => {
      const booked = counts[win.id] || 0;
      const remaining = Math.max(0, maxCapacity - booked);
      return {
        id: win.id,
        label: win.label,
        labelHi: win.labelHi,
        time: win.time,
        capacity: maxCapacity,
        booked,
        remaining,
        available: remaining > 0
      };
    });

    return ok({
      date: dateParam,
      capacityPerSlot: maxCapacity,
      windows
    });
  } catch (error) {
    console.error('[Slots API Error]', error);
    return fail('Unable to check slot availability.', 500);
  }
}
