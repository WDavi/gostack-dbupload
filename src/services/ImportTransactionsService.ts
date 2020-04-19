import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}

class ImportTransactionsService {
  async execute(parsedTransactions: Request[]): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const createdTransactions = [] as Transaction[];
    for (const transactionRequest of parsedTransactions) {
      const newTransaction = await createTransaction.execute(
        transactionRequest,
      );
      createdTransactions.push(newTransaction);
    }

    return createdTransactions;
  }
}

export default ImportTransactionsService;
