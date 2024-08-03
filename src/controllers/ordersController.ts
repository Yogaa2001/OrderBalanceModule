import { Request, Response } from 'express';
import { placeOrder } from '../services/ordersService'; // Ensure the path is correct

export const placeOrderController = async (req: Request, res: Response) => {
    try {
        const { user_id, order_type, currency_symbol, price, quantity } = req.body;

        // Create an Order object
        const order = {
            user_id,
            order_type,
            currency_symbol,
            price,
            quantity
        };

        // Call the placeOrder function with the Order object
        await placeOrder(order);

        res.status(200).send('Order placed successfully');
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Failed to create order');
    }
};
