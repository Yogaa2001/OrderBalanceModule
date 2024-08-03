import express from 'express';
import bodyParser from 'body-parser';
import ordersRouter from './routes/ordersRouter';
import pool from './database'; // Correctly import the pool

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api', ordersRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


const main = async () => {
    try {
        // Get a connection from the pool
        const connection = await pool.getConnection();

        // Perform your database operations
        const [rows] = await connection.query('SELECT * FROM Orders');

        console.log(rows);

        // Release the connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

main();


