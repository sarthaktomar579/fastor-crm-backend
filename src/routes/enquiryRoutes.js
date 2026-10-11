import express from 'express';
import {
  submitPublicEnquiry,
  getUnclaimedEnquiries,
  claimEnquiry,
  getMyClaimedEnquiries,
  getEnquiryById,
} from '../controllers/enquiryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint: Capture prospective client enquiry (No Auth required)
router.post('/public', submitPublicEnquiry);
router.post('/', submitPublicEnquiry); // Alias

// Protected endpoints for counselors / employees (Requires JWT)
router.get('/unclaimed', protect, getUnclaimedEnquiries);
router.patch('/:id/claim', protect, claimEnquiry);
router.post('/:id/claim', protect, claimEnquiry); // Support POST as well
router.get('/claimed', protect, getMyClaimedEnquiries);
router.get('/my-claimed', protect, getMyClaimedEnquiries); // Alias
router.get('/:id', protect, getEnquiryById);

export default router;
