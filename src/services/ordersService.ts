import pool from '../database'; // Ensure the path is correct

interface Order {
    user_id: number;
    order_type: string;
    currency_symbol: string;
    price: number;
    quantity: number;
}

export const placeOrder = async (order: Order) => {
    const { user_id, order_type, currency_symbol, price, quantity } = order;

    const connection = await pool.getConnection(); // Get a connection from the pool

    try {
        await connection.beginTransaction();

        // Insert into Orders table
        await connection.query(
            'INSERT INTO Orders (user_id, order_type, currency_symbol, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, order_type, currency_symbol, price, quantity, 'open']
        );

        console.log(`Order inserted: User ${user_id}, Type ${order_type}, Symbol ${currency_symbol}, Price ${price}, Quantity ${quantity}`);

        if (order_type === 'buy') {
            // Update Balances table for buy order
            await connection.query(
                'INSERT INTO Balances (user_id, currency_symbol, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)',
                [user_id, currency_symbol, quantity]
            );
        } else if (order_type === 'sell') {
            // Deduct from Balances table for sell order
            await connection.query(
                'INSERT INTO Balances (user_id, currency_symbol, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = balance - VALUES(balance)',
                [user_id, currency_symbol, quantity]
            );
        }

        await connection.commit();
        console.log(`Balance updated: User ${user_id}, Symbol ${currency_symbol}, Quantity ${quantity}`);
    } catch (error) {
        await connection.rollback();
        console.error('Error processing order:', error);
        throw error;
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};
