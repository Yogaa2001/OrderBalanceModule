import { Kafka } from 'kafkajs';
import pool from './database'; // Adjust this path as needed

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: ['localhost:9092'], // Adjust this with your Kafka broker details
});

const consumer = kafka.consumer({ groupId: 'order-group' });

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'orders', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const order = JSON.parse(message.value!.toString());

            const { user_id, order_type, currency_symbol, price, quantity } = order;

            const connection = await pool.getConnection(); // Get a connection from the pool

            try {
                await connection.beginTransaction();

                if (order_type === 'buy') {
                    // Insert into Orders table
                    await connection.query(
                        'INSERT INTO Orders (user_id, order_type, currency_symbol, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?)',
                        [user_id, order_type, currency_symbol, price, quantity, 'open']
                    );

                    // Update Balances table
                    await connection.query(
                        'INSERT INTO Balances (user_id, currency_symbol, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)',
                        [user_id, currency_symbol, quantity]
                    );
                } else if (order_type === 'sell') {
                    // Insert into Orders table
                    await connection.query(
                        'INSERT INTO Orders (user_id, order_type, currency_symbol, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?)',
                        [user_id, order_type, currency_symbol, price, quantity, 'open']
                    );

                    // Deduct from Balances table
                    await connection.query(
                        'INSERT INTO Balances (user_id, currency_symbol, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = balance - VALUES(balance)',
                        [user_id, currency_symbol, quantity]
                    );
                }

                await connection.commit();
                console.log('Order processed successfully');
            } catch (error) {
                await connection.rollback();
                console.error('Error processing order:', error);
            } finally {
                connection.release(); // Release the connection back to the pool
            }
        },
    });
};

run().catch(console.error);
