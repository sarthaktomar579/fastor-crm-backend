import Enquiry from '../models/Enquiry.js';

// @desc    Submit public enquiry form (captures lead from prospective client)
// @route   POST /api/enquiries/public (or POST /api/enquiries)
// @access  Public (No authentication required)
export const submitPublicEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, courseInterest, notes, source } = req.body;

    if (!name || !email || !courseInterest) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and course interest are required fields',
      });
    }

    const enquiry = await Enquiry.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      courseInterest,
      notes: notes || '',
      source: source || 'online_form',
      status: 'unclaimed',
      claimedBy: null,
      claimedAt: null,
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! A counselor will reach out shortly.',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch all unclaimed (public) leads
// @route   GET /api/enquiries/unclaimed
// @access  Private (Counselor/Employee)
export const getUnclaimedEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ status: 'unclaimed' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim an enquiry (Assigns enquiry to logged-in counselor & makes it private)
// @route   PATCH /api/enquiries/:id/claim
// @access  Private (Counselor/Employee)
export const claimEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const counselorId = req.user._id;

    // First check if the enquiry exists
    const existingEnquiry = await Enquiry.findById(id);
    if (!existingEnquiry) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID ${id} not found`,
      });
    }

    // Check if already claimed
    if (existingEnquiry.status === 'claimed') {
      if (existingEnquiry.claimedBy && existingEnquiry.claimedBy.toString() === counselorId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You have already claimed this enquiry',
          data: existingEnquiry,
        });
      }

      return res.status(409).json({
        success: false,
        message: 'This enquiry has already been claimed by another counselor and is no longer public',
      });
    }

    // Atomic update to avoid race conditions between multiple counselors
    const updatedEnquiry = await Enquiry.findOneAndUpdate(
      { _id: id, status: 'unclaimed' },
      {
        $set: {
          status: 'claimed',
          claimedBy: counselorId,
          claimedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).populate('claimedBy', 'name email');

    if (!updatedEnquiry) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: This enquiry was claimed by another counselor just now',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry claimed successfully. It is now private and assigned to you.',
      data: updatedEnquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch leads claimed by the currently logged-in user
// @route   GET /api/enquiries/claimed (or /api/enquiries/my-claimed)
// @access  Private (Counselor/Employee)
export const getMyClaimedEnquiries = async (req, res, next) => {
  try {
    const counselorId = req.user._id;

    const enquiries = await Enquiry.find({
      status: 'claimed',
      claimedBy: counselorId,
    })
      .sort({ claimedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single enquiry by ID
// @route   GET /api/enquiries/:id
// @access  Private (Counselor/Employee)
export const getEnquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id).populate('claimedBy', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID ${id} not found`,
      });
    }

    // Check privacy: If claimed by someone else, non-admin counselors cannot view
    if (
      enquiry.status === 'claimed' &&
      enquiry.claimedBy &&
      enquiry.claimedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: This enquiry has been claimed by another counselor',
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};
