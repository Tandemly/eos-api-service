const fs = require('fs');
const path = require('path');
const { map, filter } = require('lodash');
const { connect } = require('../../config/mongoose');
const Message = require('../models/message.model');
const Transaction = require('../models/transaction.model');
const Block = require('../models/block.model');
const Account = require('../models/account.model');
const User = require('../models/user.model');
const mongoose = require('../../config/mongoose');

const log = msg => console.log(`[test db] ${msg}`);

const loadJSON = rel =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, rel), {
      encoding: 'utf-8',
    }),
  );

const loadAPIUsers = async () => {
  try {
    const users = loadJSON('./data/users.data.json');
    await User.remove({});
    const loaded = await User.insertMany(users);
    log(`-> Loaded ${loaded.length} API users`);
    return loaded;
  } catch (err) {
    console.log('[API Users] error:', err);
  }
};

const loadAccounts = async () => {
  try {
    const accounts = loadJSON('./data/accounts.data.json');
    await Account.remove({});
    const loaded = await Account.insertMany(accounts);
    log(`-> Loaded ${loaded.length} EOS Accounts`);
    return loaded;
  } catch (err) {
    console.log('[Accounts] error:', err);
  }
};

const loadMessages = async () => {
  try {
    const messages = loadJSON('./data/messages.data.json');
    await Message.remove({});
    const loaded = await Message.insertMany(messages);
    log(`-> Loaded ${loaded.length} Messages`);
    return loaded;
  } catch (err) {
    console.log('[Message] error:', err);
  }
};

const loadTransactions = async (messages) => {
  try {
    const transactions = loadJSON('./data/transactions.data.json').map((transaction) => {
      const msgs = map(
        filter(messages, { transaction_id: transaction.transaction_id }, msg => msg._id),
      );
      return {
        ...transaction,
        messages: msgs,
      };
    });
    await Transaction.remove({});
    const loaded = await Transaction.insertMany(transactions);
    log(`-> Loaded ${loaded.length} Transactions`);
    return loaded;
  } catch (err) {
    console.log('[Transactions] error:', err);
  }
};

const loadBlocks = async (transactions) => {
  try {
    const blocks = loadJSON('./data/blocks.data.json').map((block) => {
      const txns = map(filter(transactions, { block_id: block.block_id }, txn => txn._id));
      return {
        ...block,
        transactions: txns,
      };
    });
    await Block.remove({});
    const loaded = await Block.insertMany(blocks);
    log(`-> Loaded ${loaded.length} Blocks`);
    return loaded;
  } catch (err) {
    console.log('[Blocks] error:', err);
  }
};

try {
  // open mongoose connection
  mongoose.connect();

  console.log('[test db] Loading ...');
  loadAPIUsers()
    .then(loadAccounts)
    .then(loadMessages)
    .then(loadTransactions)
    .then(loadBlocks)
    .then((blocks) => {
      console.log('[test db] Done.');
      process.exit(0);
    });
} catch (err) {
  console.log('unhandled error:', err);
  process.exit(1);
}
