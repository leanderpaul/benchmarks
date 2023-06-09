/**
 * Importing npm packages.
 */
import { faker } from '@faker-js/faker';
import fs from 'fs';
import inquirer from 'inquirer';
import mongoose from 'mongoose';

/**
 * Importing user defined packages.
 */
import { logger } from '../utils/logger.js';

/**
 * Declaring the constants.
 */
const sampleSize = 1_000n;
const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  gender: String,
});
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model('user', userSchema);

const blogSchema = new mongoose.Schema({
  userId: mongoose.SchemaTypes.ObjectId,
  slug: String,
  title: String,
  content: [String],
});
blogSchema.index({ userId: 1, slug: 1 }, { unique: true });
const Blog = mongoose.model('blog', blogSchema);

const databaseUri = process.env.DB_URI || 'mongodb://localhost/benchmarks';
await mongoose.connect(databaseUri);
logger.debug('Connected to database');

/** Inserting sample data into the database if not present */
const userCount = await User.estimatedDocumentCount();

if (userCount < sampleSize) {
  logger.debug('Inserting sample data');
  let users = [];
  let blogs = [];
  let userCount = 0;
  let blogCount = 0;
  for (let index = 0; index < 10_000_000; index++) {
    const _id = new mongoose.Types.ObjectId();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const gender = faker.person.sex();
    const email = index + '-' + faker.internet.email({ firstName, lastName });
    users.push({ _id, firstName, lastName, gender, email });
    userCount++;

    const blogsToCreate = faker.number.int({ min: 1, max: 20 });
    for (let index = 0; index < blogsToCreate; index++) {
      const title = faker.lorem.text();
      const slug = faker.helpers.slugify(title);
      const content = faker.lorem.paragraphs({ min: 5, max: 30 }, '\n').split('\n');
      blogs.push({ userId: _id, slug, title, content });
      blogCount++;
    }

    if (blogs.length > 1000) {
      await User.insertMany(users);
      await Blog.insertMany(blogs);
      users = [];
      blogs = [];
    }
  }

  if (blogs.length > 0) {
    await User.insertMany(users);
    await Blog.insertMany(blogs);
  }

  logger.debug(`Inserted ${formatNumber(userCount)} users`);
  logger.debug(`Inserted ${formatNumber(blogCount)} blogs`);
} else logger.debug(`${formatNumber(userCount)} users already present in the database`);
logger.debug();

const dirname = import.meta.url.split('/').slice(2, -1).join('/');
const dirnames = fs.readdirSync(dirname).filter((filename) => !filename.endsWith('.js'));
const benchmarks = dirnames.map((name) => ({ name: name.split('-').join(' '), value: `${dirname}/${name}/${name}.benchmark.js` }));
if (benchmarks.length === 0) throw new Error('No Benchmarks available');

let benchmarkFilename;
if (benchmarks.length > 1) {
  const answers = await inquirer.prompt([{ type: 'list', name: 'filename', message: 'What benchmark to run?', choices: benchmarks }]);
  benchmarkFilename = answers.filename;
} else benchmarkFilename = benchmarks[0].value;

const benchmark = await import(benchmarkFilename);
await benchmark.default();

await mongoose.connection.close();
