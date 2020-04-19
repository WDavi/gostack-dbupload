import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getRepository(Transaction);
    const findTransaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (!findTransaction) {
      throw new AppError('Invalid Request, transaction does not exist');
    }

    await transactionsRepository.remove(findTransaction);
  }
}

export default DeleteTransactionService;
