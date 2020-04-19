import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);
    const currentBalance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > currentBalance.total) {
      throw new AppError(
        'Invalid transaction, outcome is larger than total balance',
      );
    }

    const findCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (findCategory) {
      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category: findCategory,
      });
      await transactionsRepository.save(transaction);

      return transaction;
    }

    const newCategory = categoriesRepository.create({ title: category });
    await categoriesRepository.save(newCategory);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: newCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
