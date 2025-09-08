import express from 'express';
import sql from '../config/db.js';
export async function getAllTransactions(req, res) {
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
}

export async function createTransaction(req, res) {
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
    }

export async function deleteTransaction(req, res) {
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



}

export async function getTransactionSummary(req, res) {
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
}