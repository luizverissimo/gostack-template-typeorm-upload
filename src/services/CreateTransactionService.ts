import AppError from '../errors/AppError';

import {
  TransactionRepository,
  getCustomRepository,
  getRepository,
} from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }
    let transactionCatergory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCatergory) {
      transactionCatergory = categoryRepository.create({ title: category });
      await categoryRepository.save(transactionCatergory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCatergory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
