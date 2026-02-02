const { Client, Car, Reservation, Maintenance, Contract } = require('../../models');
const { RESERVATION_STATUS, CAR_STATUS } = require('../../config/constants');
const { successResponse } = require('../../utils');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get counts
    const [
      totalClients,
      totalCars,
      availableCars,
      rentedCars,
      pendingReservations,
      activeReservations,
      thisMonthReservations,
      lastMonthReservations,
      maintenanceDue,
      activeContracts
    ] = await Promise.all([
      Client.countDocuments(),
      Car.countDocuments({ isActive: true }),
      Car.countDocuments({ status: CAR_STATUS.AVAILABLE, isActive: true }),
      Car.countDocuments({ status: CAR_STATUS.RENTED, isActive: true }),
      Reservation.countDocuments({ status: RESERVATION_STATUS.PENDING }),
      Reservation.countDocuments({ status: RESERVATION_STATUS.ACTIVE }),
      Reservation.countDocuments({ createdAt: { $gte: thisMonth } }),
      Reservation.countDocuments({ 
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd } 
      }),
      Car.countDocuments({
        isActive: true,
        $expr: {
          $gte: [
            { $subtract: ['$mileage', '$lastMaintenanceKm'] },
            '$maintenanceThreshold'
          ]
        }
      }),
      Contract.countDocuments({ isSigned: true })
    ]);

    // Revenue calculation
    const thisMonthRevenue = await Reservation.aggregate([
      {
        $match: {
          status: { $in: [RESERVATION_STATUS.COMPLETED, RESERVATION_STATUS.ACTIVE] },
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalPrice' }
        }
      }
    ]);

    const lastMonthRevenue = await Reservation.aggregate([
      {
        $match: {
          status: { $in: [RESERVATION_STATUS.COMPLETED, RESERVATION_STATUS.ACTIVE] },
          createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalPrice' }
        }
      }
    ]);

    // Recent reservations
    const recentReservations = await Reservation.find()
      .populate('client', 'name email photo')
      .populate('car', 'brand model licensePlate')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming returns (active reservations ending soon)
    const upcomingReturns = await Reservation.find({
      status: RESERVATION_STATUS.ACTIVE,
      returnDate: { $gte: today, $lte: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) }
    })
      .populate('client', 'name phone')
      .populate('car', 'brand model licensePlate')
      .sort({ returnDate: 1 })
      .limit(5);

    successResponse(res, 'Dashboard data retrieved', {
      stats: {
        clients: totalClients,
        cars: {
          total: totalCars,
          available: availableCars,
          rented: rentedCars
        },
        reservations: {
          pending: pendingReservations,
          active: activeReservations,
          thisMonth: thisMonthReservations,
          lastMonth: lastMonthReservations
        },
        contracts: {
          active: activeContracts
        },
        revenue: {
          thisMonth: thisMonthRevenue[0]?.total || 0,
          lastMonth: lastMonthRevenue[0]?.total || 0
        },
        maintenanceDue
      },
      recentReservations,
      upcomingReturns
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
