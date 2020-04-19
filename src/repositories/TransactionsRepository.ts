import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeBalance = (
      await this.find({
        where: { type: 'income' },
      })
    ).reduce((incomeAccumulator, transaction) => {
      return incomeAccumulator + transaction.value;
    }, 0);

    const outcomeBalance = (
      await this.find({
        where: { type: 'outcome' },
      })
    ).reduce((outcomeAccumulator, transaction) => {
      return outcomeAccumulator + transaction.value;
    }, 0);

    const balance = {
      income: incomeBalance,
      outcome: outcomeBalance,
      total: incomeBalance - outcomeBalance,
    };

    return balance;
  }
}

export default TransactionsRepository;
