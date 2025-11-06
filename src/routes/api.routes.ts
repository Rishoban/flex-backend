import { Router, Request, Response } from 'express';
import { ResponseUtils } from '@/utils/helpers';
import { body, query } from 'express-validator';
import AuthController from '../controllers/auth.controller';
import reviewController from '../controllers/review.controller';
import { authenticateToken } from '../middleware/auth.middleware';

// Validation middleware
const rejectReviewValidation = [
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Rejection reason must be a string between 1 and 500 characters')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('sortBy')
    .optional()
    .isIn(['submittedAt', 'rating', 'guestName', 'status'])
    .withMessage('Sort by must be one of: submittedAt, rating, guestName, status'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('status')
    .optional()
    .isString()
    .withMessage('Status must be a string'),
  query('channel')
    .optional()
    .isString()
    .withMessage('Channel must be a string')
];

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * tags:
 *   - name: API
 *     description: Basic API endpoints
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Dashboard
 *     description: Dashboard statistics endpoints
 *   - name: Form Data
 *     description: Form dropdown and configuration data
 *   - name: Reviews
 *     description: Review management endpoints
 *   - name: Dashboard
 *     description: Dashboard statistics endpoints
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     expiresIn:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', AuthController.loginValidation, AuthController.login);

// Apply authentication middleware to all routes below
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get all reviews from cache with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of reviews per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [submittedAt, rating, guestName, status]
 *           default: submittedAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, pending, approved]
 *         description: Filter by review status
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *           enum: [airbnb, booking, direct, google]
 *         description: Filter by booking channel
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 */
router.get('/reviews', reviewController.getReviews);

/**
 * @swagger
 * /api/v1/reviews/stats:
 *   get:
 *     tags: [Reviews]
 *     summary: Get review statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     byStatus:
 *                       type: object
 *                     lastSync:
 *                       type: string
 */
router.get('/reviews/stats', reviewController.getReviewStats);

/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get a specific review by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *       404:
 *         description: Review not found
 *       400:
 *         description: Invalid review ID
 */
router.get('/reviews/:id', reviewController.getReviewById);

/**
 * @swagger
 * /api/v1/reviews/sync:
 *   post:
 *     tags: [Reviews]
 *     summary: Manually trigger review sync
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review sync completed successfully
 *       500:
 *         description: Review sync failed
 */
router.post('/reviews/sync', reviewController.syncReviews);

/**
 * @swagger
 * /api/v1/reviews/{id}/approve:
 *   patch:
 *     tags: [Reviews]
 *     summary: Approve a review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review approved successfully
 *       404:
 *         description: Review not found
 *       400:
 *         description: Invalid review ID
 */
router.patch('/reviews/:id/approve', reviewController.approveReview);

/**
 * @swagger
 * /api/v1/reviews/{id}/publish:
 *   patch:
 *     tags: [Reviews]
 *     summary: Publish a review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review published successfully
 *       404:
 *         description: Review not found
 *       400:
 *         description: Invalid review ID
 */
router.patch('/reviews/:id/publish', reviewController.publishReview);

/**
 * @swagger
 * /api/v1/reviews/{id}/reject:
 *   patch:
 *     tags: [Reviews]
 *     summary: Reject a review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *                 example: "Inappropriate content"
 *     responses:
 *       200:
 *         description: Review rejected successfully
 *       404:
 *         description: Review not found
 *       400:
 *         description: Invalid review ID
 */
router.patch('/reviews/:id/reject', rejectReviewValidation, reviewController.rejectReview);

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Dashboard statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReviews:
 *                       type: number
 *                       example: 55
 *                     averageRating:
 *                       type: number
 *                       example: 4.4
 *                     pendingReviews:
 *                       type: number
 *                       example: 8
 *                     publishedReviews:
 *                       type: number
 *                       example: 42
 *                     flaggedIssues:
 *                       type: number
 *                       example: 4
 *                     propertiesCount:
 *                       type: number
 *                       example: 3
 */
router.get('/dashboard/stats', reviewController.getDashboardStats);

/**
 * @swagger
 * /api/v1/form/dropdowns:
 *   get:
 *     tags: [Form Data]
 *     summary: Get form dropdown data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Form dropdown data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "Pending"
 *                           label:
 *                             type: string
 *                             example: "Pending Review"
 *                           description:
 *                             type: string
 *                             example: "Review is awaiting manager approval"
 *                           color:
 *                             type: string
 *                             example: "#ff9800"
 *                           icon:
 *                             type: string
 *                             example: "schedule"
 *                           sortOrder:
 *                             type: number
 *                             example: 1
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["view", "update"]
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: number
 *                           example: 5
 *                         activeCount:
 *                           type: number
 *                           example: 5
 *                         lastUpdated:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-11-06T10:30:00Z"
 */
router.get('/form/dropdowns', reviewController.getFormDropdowns);

/**
 * @swagger
 * /api/v1/channels:
 *   get:
 *     tags: [Form Data]
 *     summary: Get list of channels for dropdown
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Channels list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Channels retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     channels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "airbnb"
 *                           label:
 *                             type: string
 *                             example: "Airbnb"
 *                           description:
 *                             type: string
 *                             example: "Reviews from Airbnb platform"
 *                           count:
 *                             type: number
 *                             example: 10
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: number
 *                           example: 3
 *                         activeCount:
 *                           type: number
 *                           example: 3
 *                         lastUpdated:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-11-06T10:30:00Z"
 */
router.get('/channels', reviewController.getChannels);

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     tags: [Form Data]
 *     summary: Get list of properties for dropdown
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Properties list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Properties retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "prop_001"
 *                           label:
 *                             type: string
 *                             example: "2B N1 A - 29 Shoreditch Heights"
 *                           listingName:
 *                             type: string
 *                             example: "2B N1 A - 29 Shoreditch Heights"
 *                           description:
 *                             type: string
 *                             example: "Property with 5 reviews"
 *                           reviewCount:
 *                             type: number
 *                             example: 5
 *                           channels:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["airbnb", "booking"]
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: number
 *                           example: 3
 *                         activeCount:
 *                           type: number
 *                           example: 3
 *                         lastUpdated:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-11-06T10:30:00Z"
 */
router.get('/properties', reviewController.getProperties);

/**
 * @swagger
 * /api/v1/status:
 *   get:
 *     tags: [API]
 *     summary: Get API status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API is working
 */
router.get('/status', (req: Request, res: Response) => {
  const status = {
    message: 'Flex Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };
  
  res.json(ResponseUtils.success('API status retrieved successfully', status));
});


export { router as apiRoutes };