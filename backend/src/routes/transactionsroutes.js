import express from 'express';
import { createTransaction, getAllTransactions,deleteTransaction, getTransactionSummary } from '../controllers/transactionscontroller.js';
const router=express.Router();

router.post("/",createTransaction);
router.get("/:user_id",getAllTransactions);

router.delete("/:id",deleteTransaction);

router.get("/summary/:user_id",getTransactionSummary);

export default router;