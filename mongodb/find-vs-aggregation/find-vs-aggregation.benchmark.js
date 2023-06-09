/**
 * Importing npm packages.
 */
import mongoose from 'mongoose';

/**
 * Importing user defined packages.
 */
import { logger } from '../../utils/logger.js';

/**
 * Declaring the constants.
 */
const totalOps = 10_000n;
const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

async function benchmark(name, operation) {
  const users = await mongoose.models.user.aggregate([{ $sample: { size: totalOps } }, { $project: { email: 1 } }]);
  const emails = users.map((user) => user.email);
  const startTime = process.hrtime.bigint();
  for (const email of emails) await operation(email);
  const endTime = process.hrtime.bigint();

  const totalTime = endTime - startTime;
  const avgTime = totalTime / totalOps;
  return { name, totalTime, avgTime };
}

function printResults(results) {
  const sortedResults = results
    .sort((a, b) => parseInt(a.totalTime - b.totalTime))
    .map((obj) => ({
      Name: obj.name,
      'Total time (in ns)': formatNumber(obj.totalTime),
      'Average time (in ns)': formatNumber(obj.avgTime),
    }));
  logger.table(sortedResults);
}

export default async function () {
  logger.log('Comparing Native findOne, Mongoose findOne and Aggregation');
  const findOneResults = [
    await benchmark('Native', (email) => mongoose.connection.db.collection('users').findOne({ email })),
    await benchmark('Mongoose', (email) => mongoose.models.user.findOne({ email })),
    await benchmark('Aggregation', (email) => mongoose.models.user.aggregate([{ $match: { email } }, { $limit: 1 }])),
  ];
  printResults(findOneResults);

  logger.log('\nComparing Native find, Mongoose find and Aggregation');
  const findResults = [
    await benchmark('Native', (email) => mongoose.connection.db.collection('users').find({ email }).toArray()),
    await benchmark('Mongoose', (email) => mongoose.models.user.find({ email })),
    await benchmark('Aggregation', (email) => mongoose.models.user.aggregate([{ $match: { email } }])),
  ];
  printResults(findResults);

  logger.log('\nComparing inner join using Native findOne and find, Mongoose findOne and find and Aggregation');
  const innerJoinResults = [
    await benchmark('Native', (email) =>
      mongoose.connection.db
        .collection('users')
        .findOne({ email })
        .then((user) => mongoose.connection.db.collection('blogs').find({ userId: user._id }).toArray())
    ),
    await benchmark('Mongoose', (email) =>
      mongoose.models.user.findOne({ email }).then((user) => mongoose.models.blog.find({ userId: user._id }))
    ),
    await benchmark('Aggregation', (email) =>
      mongoose.models.user.aggregate([
        { $match: { email } },
        { $limit: 1 },
        { $lookup: { from: 'blogs', localField: '_id', foreignField: 'userId', as: 'blogs' } },
      ])
    ),
  ];
  printResults(innerJoinResults);
}
