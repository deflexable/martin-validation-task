import { MongoClient } from 'mongodb';
import { DATABASE_NAME, MONGO_URL } from '../../env.js';

const mongodb = new MongoClient(MONGO_URL);

mongodb.connect().then(() => {
    console.log(`connected to mongodb at ${MONGO_URL}`);
}).catch(e => {
    console.error(`failed to connected to mongodb at ${MONGO_URL}: ${e}`);
});

export const collection = (...args) => mongodb.db(DATABASE_NAME).collection(...args);