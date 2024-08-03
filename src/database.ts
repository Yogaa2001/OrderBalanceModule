import { createPool, Pool } from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Yogaa@2001',
    database: 'orders',
    port: 3306,
    connectTimeout: 30000, // 30 seconds
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool: Pool = createPool(dbConfig);

export default pool;

