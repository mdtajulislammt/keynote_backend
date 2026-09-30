import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { userAnalyticsParamSchema } from './analytics.dto';

const router = Router();

// Secure analytics routes with authentication
router.use(authenticate);

// Scenario 1: Group by Interests
router.get('/interests', analyticsController.getUsersByInterests);

// Scenario 2: User Posts ($lookup)
router.get(
  '/users/:userId/posts',
  validate({ params: userAnalyticsParamSchema }),
  analyticsController.getUserWithPosts
);

export const analyticsRoutes = router;
