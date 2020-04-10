const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URL);

var db = null;

module.exports = {
  async init() {
    if (!db) {
      await client.connect();

      db = client.db(process.env.MONGO_DB_NAME);
    }

    return db;
  },
  async save(collectionName, documents) {
    await db.collection(collectionName).insertMany(documents);
  },
  async find(collectionName, filters = {}, count = null) {
    if (count) {
      return await db
        .collection(collectionName)
        .find(filters, { projection: { _id: 0 } })
        .limit(count)
        .toArray();
    } else {
      return await db
        .collection(collectionName)
        .find(filters, { projection: { _id: 0 } })
        .toArray();
    }
  },
  async count(collectionName, filters = {}) {
    return await db.collection(collectionName).countDocuments(filters);
  },
  async reset() {
    if (db) {
      await db.dropDatabase();
    }
  },
  async cleanup() {
    if (client) {
      await this.reset();

      client.close();
    }
  },
};
