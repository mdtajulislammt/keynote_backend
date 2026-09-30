import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { userAnalyticsParamSchema } from './analytics.dto';

const router = Router();

// Secure analytics routes with authentication
router.use(authenticate);

// Group by Interests
router.get('/interests', analyticsController.getUsersByInterests);

// User Posts
router.get(
  '/users/:userId/posts',
  validate({ params: userAnalyticsParamSchema }),
  analyticsController.getUserWithPosts
);

export const analyticsRoutes = router;
