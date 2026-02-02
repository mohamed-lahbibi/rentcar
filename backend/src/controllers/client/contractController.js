const { Contract, Reservation } = require('../../models');
const { successResponse, notFoundResponse, parsePagination, paginatedResponse } = require('../../utils');

// @desc    Get my contracts
// @route   GET /api/client/contracts
const getMyContracts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const reservationIds = await Reservation.distinct('_id', { client: req.user._id });
    
    const [contracts, total] = await Promise.all([
      Contract.find({ reservation: { $in: reservationIds } }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contract.countDocuments({ reservation: { $in: reservationIds } })
    ]);
    successResponse(res, 'Contracts retrieved', paginatedResponse(contracts, total, page, limit));
  } catch (error) { next(error); }
};

// @desc    Get single contract
// @route   GET /api/client/contracts/:id
const getContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('reservation');
    if (!contract) return notFoundResponse(res, 'Contract');
    
    const reservation = await Reservation.findById(contract.reservation);
    if (!reservation || reservation.client.toString() !== req.user._id.toString()) {
      return notFoundResponse(res, 'Contract');
    }
    successResponse(res, 'Contract retrieved', contract);
  } catch (error) { next(error); }
};

// @desc    Sign contract
// @route   PUT /api/client/contracts/:id/sign
const signContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('reservation');
    if (!contract) return notFoundResponse(res, 'Contract');

    const reservation = await Reservation.findById(contract.reservation);
    if (!reservation || reservation.client.toString() !== req.user._id.toString()) {
      return notFoundResponse(res, 'Contract');
    }

    contract.clientSignature = req.body.signature;
    contract.clientSignedAt = new Date();
    if (contract.adminSignature) contract.isSigned = true;
    await contract.save();

    successResponse(res, 'Contract signed successfully', contract);
  } catch (error) { next(error); }
};

module.exports = { getMyContracts, getContract, signContract };
