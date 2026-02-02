const { Contract, Reservation, Settings } = require('../../models');
const { successResponse, errorResponse, notFoundResponse, createdResponse, parsePagination, paginatedResponse } = require('../../utils');
const { generateContractPDF } = require('../../services/pdfService');

// @desc    Get all contracts
// @route   GET /api/admin/contracts
const getContracts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { isSigned, search } = req.query;

    const filter = {};
    if (isSigned !== undefined) {
      filter.isSigned = isSigned === 'true';
    }
    if (search) {
      filter.$or = [
        { contractNumber: { $regex: search, $options: 'i' } },
        { 'clientInfo.name': { $regex: search, $options: 'i' } }
      ];
    }

    const [contracts, total] = await Promise.all([
      Contract.find(filter)
        .populate('reservation', 'status pickupDate returnDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Contract.countDocuments(filter)
    ]);

    successResponse(res, 'Contracts retrieved', paginatedResponse(contracts, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contract
// @route   GET /api/admin/contracts/:id
const getContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('reservation');

    if (!contract) {
      return notFoundResponse(res, 'Contract');
    }

    successResponse(res, 'Contract retrieved', contract);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate contract for reservation
// @route   POST /api/admin/contracts/generate/:reservationId
const generateContract = async (req, res, next) => {
  try {
    const { 
      pickupTime, 
      pickupLocation, 
      returnLocation, 
      deposit, 
      insuranceType, 
      additionalOptions, 
      specialConditions 
    } = req.body;

    const reservation = await Reservation.findById(req.params.reservationId)
      .populate('client')
      .populate('car');

    if (!reservation) {
      return notFoundResponse(res, 'Reservation');
    }

    // Check if contract already exists
    const existingContract = await Contract.findOne({ reservation: reservation._id });
    if (existingContract) {
      return errorResponse(res, 'Contract already exists for this reservation', 400);
    }

    // Get settings for terms
    const settings = await Settings.getSettings();

    // Create contract data with form fields
    const contractData = {
      reservation: reservation._id,
      clientInfo: {
        name: reservation.client.name,
        email: reservation.client.email,
        phone: reservation.client.phone,
        CIN: reservation.client.CIN || 'N/A',
        drivingLicense: reservation.client.drivingLicense?.number || reservation.client.drivingLicense || 'N/A',
        address: reservation.client.address ? 
          `${reservation.client.address.street || ''}, ${reservation.client.address.city || ''}`.replace(/^, |, $/g, '') : ''
      },
      carInfo: {
        brand: reservation.car.brand,
        model: reservation.car.model,
        year: reservation.car.year,
        licensePlate: reservation.car.licensePlate,
        color: reservation.car.color,
        mileage: reservation.car.mileage
      },
      rentalInfo: {
        pickupDate: reservation.pickupDate,
        returnDate: reservation.returnDate,
        pickupTime: pickupTime || '09:00',
        pickupLocation: pickupLocation || reservation.pickupLocation || 'Office',
        returnLocation: returnLocation || reservation.returnLocation || 'Office',
        totalDays: reservation.totalDays,
        dailyRate: reservation.dailyRate,
        totalPrice: reservation.totalPrice,
        deposit: deposit || 0
      },
      insuranceType: insuranceType || 'basic',
      additionalOptions: additionalOptions || {
        gps: false,
        childSeat: false,
        additionalDriver: false,
        unlimitedMileage: false
      },
      specialConditions: specialConditions || '',
      terms: settings?.termsAndConditions || 'Standard Terms and Conditions apply.',
      generatedBy: req.user._id,
      generatedByType: req.userType === 'admin' ? 'Admin' : 'Manager'
    };

    const contract = await Contract.create(contractData);

    // Generate PDF
    try {
      const pdfResult = await generateContractPDF(contract);
      contract.pdfUrl = pdfResult.url;
      contract.pdfPublicId = pdfResult.publicId;
      await contract.save();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      // Contract created but PDF generation failed
    }

    createdResponse(res, 'Contract generated successfully', contract);
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate contract PDF
// @route   POST /api/admin/contracts/:id/regenerate-pdf
const regeneratePDF = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return notFoundResponse(res, 'Contract');
    }

    const pdfResult = await generateContractPDF(contract);
    contract.pdfUrl = pdfResult.url;
    contract.pdfPublicId = pdfResult.publicId;
    await contract.save();

    successResponse(res, 'PDF regenerated successfully', { pdfUrl: contract.pdfUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark contract as signed
// @route   PUT /api/admin/contracts/:id/sign
const signContract = async (req, res, next) => {
  try {
    const { adminSignature } = req.body;
    
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return notFoundResponse(res, 'Contract');
    }

    contract.adminSignature = adminSignature;
    contract.adminSignedAt = new Date();
    
    if (contract.clientSignature) {
      contract.isSigned = true;
    }

    await contract.save();

    successResponse(res, 'Contract signed', contract);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContracts,
  getContract,
  generateContract,
  regeneratePDF,
  signContract
};
