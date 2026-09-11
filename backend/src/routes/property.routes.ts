import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { createPropertySchema, updatePropertySchema } from '../schemas/property.schema.js';

const router = Router();

router.use(authMiddleware);

router.post('/', validateBody(createPropertySchema), PropertyController.create);
router.get('/', PropertyController.list);
router.get('/:id', PropertyController.getById);
router.put('/:id', validateBody(updatePropertySchema), PropertyController.update);
router.delete('/:id', PropertyController.remove);

export default router;
