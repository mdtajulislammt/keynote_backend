import { Router } from 'express';
import { postController } from './post.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createPostSchema,
  postQuerySchema,
  postIdParamSchema,
} from './post.dto';

const router = Router();

router.post('/', authenticate, validate({ body: createPostSchema }), postController.createPost);
router.get('/', validate({ query: postQuerySchema }), postController.getPosts);
router.get('/:id', validate({ params: postIdParamSchema }), postController.getPostById);

export const postRoutes = router;
