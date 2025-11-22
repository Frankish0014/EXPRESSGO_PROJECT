import { Op } from 'sequelize';
import { Booking, BusSchedule, Route, User } from '../models';

interface MonthlyBucket {
  label: string;
  start: Date;
  end: Date;
}

export class AdminService {
  static async getOverview() {
    const [totalBookings, completedBookings, pendingBookings, cancelledBookings] =
      await Promise.all([
        Booking.count(),
        Booking.count({ where: { status: 'completed' } }),
        Booking.count({ where: { status: 'confirmed' } }),
        Booking.count({ where: { status: 'cancelled' } }),
      ]);

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const windowBookings = await Booking.findAll({
      where: { created_at: { [Op.gte]: sixMonthsAgo } },
      include: [
        {
          model: BusSchedule,
          as: 'schedule',
          attributes: ['price', 'departure_time', 'arrival_time'],
          include: [
            {
              model: Route,
              as: 'route',
              attributes: ['departure_city', 'arrival_city'],
            },
          ],
        },
      ],
      attributes: ['id', 'booking_code', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    const monthlyBuckets = this.buildMonthlyBuckets(now);
    const chartBookings: number[] = new Array(monthlyBuckets.length).fill(0);
    const chartRevenue: number[] = new Array(monthlyBuckets.length).fill(0);
    const popularRouteMap = new Map<string, number>();

    windowBookings.forEach((booking) => {
      const createdAt = booking.get('created_at') as Date;
      const schedulePrice = Number((booking as any).schedule?.price || 0);
      const bucketIndex = monthlyBuckets.findIndex(
        (bucket) => createdAt >= bucket.start && createdAt <= bucket.end
      );

      if (bucketIndex >= 0) {
        chartBookings[bucketIndex] += 1;
        if (booking.status === 'completed') {
          chartRevenue[bucketIndex] += schedulePrice;
        }
      }

      const route = (booking as any).schedule?.route;
      if (route?.departure_city && route?.arrival_city) {
        const key = `${route.departure_city} → ${route.arrival_city}`;
        popularRouteMap.set(key, (popularRouteMap.get(key) || 0) + 1);
      }
    });

    const revenueCurrentMonth =
      chartRevenue[chartRevenue.length - 1] ?? this.sumRevenueWithin(windowBookings, startOfCurrentMonth, now);
    const revenuePreviousMonth =
      chartRevenue[chartRevenue.length - 2] ??
      this.sumRevenueWithin(windowBookings, startOfPreviousMonth, endOfPreviousMonth);

    const revenueTrend =
      revenuePreviousMonth === 0
        ? revenueCurrentMonth > 0
          ? 100
          : 0
        : ((revenueCurrentMonth - revenuePreviousMonth) / revenuePreviousMonth) * 100;

    const averageDailyIncome =
      revenueCurrentMonth / Math.max(1, now.getDate());

    const recentBookingsRaw = await Booking.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email'],
        },
        {
          model: BusSchedule,
          as: 'schedule',
          attributes: ['price', 'departure_time'],
          include: [
            {
              model: Route,
              as: 'route',
              attributes: ['departure_city', 'arrival_city'],
            },
          ],
        },
      ],
    });

    const recentBookings = recentBookingsRaw.map((booking) => {
      const schedule: any = booking.get('schedule');
      const route = schedule?.route;

      return {
        id: booking.id,
        code: booking.booking_code,
        passenger: booking.user?.full_name || 'N/A',
        route: route
          ? `${route.departure_city} → ${route.arrival_city}`
          : '—',
        createdAt: booking.created_at,
        status: booking.status,
        amount: Number(schedule?.price || 0),
      };
    });

    const popularRoutes = Array.from(popularRouteMap.entries())
      .map(([routeName, count]) => ({ route: routeName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      stats: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
      },
      revenue: {
        currentMonth: revenueCurrentMonth,
        previousMonth: revenuePreviousMonth,
        trend: revenueTrend,
        averageDaily: averageDailyIncome,
      },
      chart: {
        labels: monthlyBuckets.map((bucket) => bucket.label),
        bookings: chartBookings,
        revenue: chartRevenue,
      },
      recentBookings,
      popularRoutes,
    };
  }

  private static buildMonthlyBuckets(now: Date): MonthlyBucket[] {
    const buckets: MonthlyBucket[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      buckets.push({
        label: date.toLocaleString('default', { month: 'short' }),
        start,
        end,
      });
    }

    return buckets;
  }

  private static sumRevenueWithin(bookings: Booking[], start: Date, end: Date): number {
    return bookings.reduce((sum, booking) => {
      const createdAt = booking.get('created_at') as Date;
      if (
        createdAt >= start &&
        createdAt <= end &&
        booking.status === 'completed'
      ) {
        return sum + Number((booking as any).schedule?.price || 0);
      }
      return sum;
    }, 0);
  }
}


