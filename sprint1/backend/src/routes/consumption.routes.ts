import { Router } from 'express';
import { ConsumptionController } from '../controllers/consumption.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { consumptionItemSchema, batchConsumptionSchema } from '../schemas/consumption.schema.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', validateBody(consumptionItemSchema), ConsumptionController.add);
router.post('/batch', validateBody(batchConsumptionSchema), ConsumptionController.addBatch);
router.get('/', ConsumptionController.list);
router.post('/seed-teste', ConsumptionController.seedTextbook);
router.delete('/:consumoId', ConsumptionController.remove);

export default router;
