import { Router } from 'express';
import { noteController } from './note.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants';
import {
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
  noteIdParamSchema,
} from './note.dto';

const router = Router();

// Protect all note routes with authentication
router.use(authenticate);

// User & Admin accessible routes
router.post('/', validate({ body: createNoteSchema }), noteController.createNote);
router.get('/', validate({ query: noteQuerySchema }), noteController.getUserNotes);
router.get('/:id', validate({ params: noteIdParamSchema }), noteController.getNoteById);
router.put(
  '/:id',
  validate({ params: noteIdParamSchema, body: updateNoteSchema }),
  noteController.updateNote
);
router.delete('/:id', validate({ params: noteIdParamSchema }), noteController.deleteNote);

export const noteRoutes = router;

// Admin-specific notes router
const adminRouter = Router();
adminRouter.use(authenticate, authorize(UserRole.ADMIN));
adminRouter.get('/', validate({ query: noteQuerySchema }), noteController.getAllNotes);
adminRouter.get('/:id', validate({ params: noteIdParamSchema }), noteController.getNoteById);

export const adminNoteRoutes = adminRouter;
