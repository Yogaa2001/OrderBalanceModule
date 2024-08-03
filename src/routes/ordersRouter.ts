import { Router } from 'express';
import { placeOrderController } from '../controllers/ordersController';

const router = Router();

router.post('/place-order', placeOrderController);

export default router;
