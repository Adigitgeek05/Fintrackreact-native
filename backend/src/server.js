import express, { response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import sql from './config/db.js';
import rateLimiterMiddleware from './middleware/rateLimiter.js';
import transactionsRoutes from './routes/transactionsroutes.js';

const app = express();
app.get("/",(req,res)=>
{
    res.send("hello from express");
})
//middleware
app.use(express.json());
app.use(rateLimiterMiddleware);
console.log(process.env.PORT);
async function initDb(){
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id varchar(255) NOT NULL,
            title varchar(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category varchar(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;
    } catch (error) {
        console.error("Error initializing database:", error);
        process.exit(1); // Exit the process with an error code
    }
}

initDb().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server started on port ${process.env.PORT}`);
    });
})


app.use("/api/transactions", transactionsRoutes);
