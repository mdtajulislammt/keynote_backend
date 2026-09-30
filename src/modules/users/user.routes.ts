import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants';
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
  userIdParamSchema,
} from './user.dto';

const router = Router();

// All user management routes require Admin privileges
router.use(authenticate, authorize(UserRole.ADMIN));

router.post('/', validate({ body: createUserSchema }), userController.createUser);
router.get('/', validate({ query: userQuerySchema }), userController.getUsers);
router.get('/:id', validate({ params: userIdParamSchema }), userController.getUserById);
router.put(
  '/:id',
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  userController.updateUser
);
router.delete('/:id', validate({ params: userIdParamSchema }), userController.deleteUser);

export const userRoutes = router;
