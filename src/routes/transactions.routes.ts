import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import { readFileSync, unlink } from 'fs';
import multer from 'multer';
import { parse } from 'papaparse';

import uploadConfig from '../config/uploadCSV';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    relations: ['category'],
    select: ['id', 'type', 'value', 'title'],
  });
  const transactionsBalance = await transactionsRepository.getBalance();

  return response.json({
    transactions,
    balance: transactionsBalance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(200).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();
    const uploadedCSV = request.file;
    const fileInSystem = readFileSync(uploadedCSV.path, 'utf8');

    const parsedCSV = parse(fileInSystem, {
      // complete: result => console.log(result.data),
      header: true,
      transform: value => value.trimLeft(),
      transformHeader: header => header.trimLeft(),
      skipEmptyLines: true,
    });

    unlink(uploadedCSV.path, () => {});

    const createdTransactions = await importTransactions.execute(
      parsedCSV.data,
    );
    // console.log(parsedCSV.data);

    return response.json(createdTransactions);
  },
);

export default transactionsRouter;
