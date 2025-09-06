import express, { response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import sql from './config/db.js';

const app = express();
app.get("/",(req,res)=>
{
    res.send("hello from express");
})
app.use(express.json());

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

app.post("/api/transactions",async(req,res)=>{
    try {
        const {user_id,title,amount,category}=req.body;
        if(!user_id || !title || !category || amount ===undefined)
        {
            return res.status(400).json({success: false,message: "Please provide all required fields"});
        }

        const transaction=await sql`
        INSERT INTO TRANSACTIONS (user_id,title,amount,category)
        VALUES (${user_id},${title},${amount},${category})
        RETURNING *
        `;
        console.log(transaction);
        res.status(201).json({success: true,data: transaction[0]});
    }

    catch (error) {
       console.error("Error creating transaction:", error);
       res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/transactions/:user_id",async(req,res)=>{
    try{
        const {user_id}=req.params;
        const transactions=await sql`
        SELECT * FROM transactions WHERE user_id=${user_id} ORDER BY created_at DESC
        `;
        res.status(200).json({success: true,data: transactions});
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal server error" });
    }       
});

app.delete("/api/transactions/:id",async(req,res)=>{
    try {
        const {id}=req.params;

        if(isNaN(parseInt(id))){
            return res.status(400).json({success: false,message: "Invalid transaction id"});
        }
        const result=await sql`
        DELETE FROM transactions WHERE id=${id} RETURNING *
        `;          
        if(result.length===0)
        {
            return res.status(404).json({success: false,message: "Transaction not found"});
        }

        res.status(200).json({success: true,message: "Transaction deleted successfully"});
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
});
app.get("/api/transactions/summary/:user_id",async(req,res)=>{
    try {
        const {user_id}=req.params;
        const balanceresult=await sql`
        SELECT COALESCE(SUM(amount),0) AS balance FROM transactions WHERE user_id=${user_id}
        `;
        const incomeResult=await sql`
        SELECT COALESCE(SUM(amount),0) AS income FROM transactions WHERE user_id=${user_id} AND amount>0
        `;
        const expenseResult=await sql`
        SELECT COALESCE(SUM(amount),0) AS expense FROM transactions WHERE user_id=${user_id} AND amount<0
        `;
        res.status(200).json({success: true,data: {balance: balanceresult[0].balance,income: incomeResult[0].income,expense: expenseResult[0].expense}});
    } catch (error) {
        console.error("Error fetching transaction summary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});