import pool from '../database';

interface Order {
    user_id: number;
    order_type: string;
    currency_symbol: string;
    price: number;
    quantity: number;
}

export const placeOrder = async (order: Order) => {
    const { user_id, order_type, currency_symbol, price, quantity } = order;

    const connection = await pool.getConnection();

    try {
        await connection.query('START TRANSACTION');

        // Insert order into MySQL database
        await connection.query(
            'INSERT INTO Orders (user_id, order_type, currency_symbol, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, order_type, currency_symbol, price, quantity, 'open']
        );

        await connection.query('COMMIT');
        console.log('Order placed successfully in MySQL');
    } catch (error) {
        await connection.query('ROLLBACK');
        console.error('Error placing order in MySQL:', error);
        throw new Error('Failed to place order in MySQL');
    } finally {
        connection.release();
    }
};
