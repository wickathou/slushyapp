import { Pool, QueryResult } from "pg";

console.log({
    // connectionString: process.env.DATABASE_URL,
    // user: process.env.DB_USERNAME,
    // password: process.env.DB_PWD,
    // host: process.env.DB_HOST,
    // port: Number.parseInt(process.env.DB_PORT),
    // database: process.env.DB_NAME,
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = {
    query: <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
        return pool.query<T>(text, params);
    },
};

export default db;
