const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: null,
});

const database = require('../database');

const { getPhotos, getRandomPhoto } = require('../services/UnsplashService.js');

const { ObjectID } = require('mongodb');

class PhotoFeed {
  static PHOTO_COLL = 'photos';

  constructor() {
    // this.page = seed - 1;
    this.page = 210; // used for seeding the database
    this.photos = [];
    this.storedPhotos = [];
    this.windowSize = 10;
    this.windowStart = 0;

    this.ratelimit = null;

    this.queries = [];
  }

  async paginate() {
    let retrieved = [];

    const partitions = this.queries.length + 1;
    const partitionSize = Math.floor(this.windowSize / partitions);
    logger.debug(
      `Paginating for ${partitions} partitions of ${partitionSize} size`
    );

    if (this.queries.length > 0) {
      const results = await Promise.all(
        this.queries.map((query) =>
          getRandomPhoto({ query, count: partitionSize })
        )
      );
      retrieved = results.map((p) => p.data).flat();
      logger.debug(
        `Retrieved ${this.queries.length} queries: ${retrieved.map(
          (r) => r.id
        )}`
      );

      results.forEach(({ rateLimit }) => this.updateRateLimit(rateLimit));
    }

    const remaining = this.windowSize - retrieved.length;
    let i = 0;
    while (this.storedPhotos.length < remaining) {
      this.page++;
      logger.debug(`Paginated now on page ${this.page}`);

      // const data = await database.find('photos', {}, 10);
      const { data, rateLimit } = await getPhotos({ page: this.page });
      this.updateRateLimit(rateLimit);

      if (data.length === 0) {
        logger.debug(`Sleeping ${i} seconds`);
        await new Promise((r) => setTimeout(r, 1000 * i));
        i++;
      } else {
        logger.debug(`Storing ${data.length} photos from ${this.page}`);
        this.storedPhotos.push(...data);
        database.save('photos', data);
      }
    }

    retrieved = retrieved.concat(this.storedPhotos.splice(0, remaining));
    logger.debug(`Added paged photos: ${retrieved.map((r) => r.id)}`);

    retrieved.sort(() => Math.random() - 0.5);
    logger.debug(`Shuffled: ${retrieved.map((r) => r.id)}`);

    this.photos.push(...retrieved);
    logger.info(`Added ${retrieved.length} photos`);
  }

  updateRateLimit({ remaining, total }) {
    const per = Math.round((remaining / total) * 100);
    logger.debug(`Comparing ratelimit ${per} against ${this.ratelimit}`);

    if (this.ratelimit === null || per < this.ratelimit) {
      logger.info(`Updating ratelimit from ${this.ratelimit} to ${per}`);
      this.ratelimit = per;
    }
  }

  getWindow() {
    logger.debug(
      `Retrieving window ${this.windowStart} - ${
        this.windowStart + this.windowSize
      }`
    );
    return {
      data: this.photos.slice(
        this.windowStart,
        this.windowStart + this.windowSize
      ),
      ratelimit: this.ratelimit,
    };
  }

  async updateQueries({ query, add }) {
    if (add) {
      logger.debug(`Testing query ${query}`);
      await getRandomPhoto({ query });

      this.queries.push(query);
      logger.debug(`Query ${query} added`);
    } else {
      const index = this.queries.indexOf(query);

      if (index >= 0) {
        this.queries.splice(index, 1);
        logger.debug(`Query ${query} removed`);
      } else {
        logger.warn(`Query ${query} not found so could not be removed`);
      }
    }
  }

  async getNext(lastPhotoId = null) {
    logger.debug(`Getting next ${this.windowSize} photos with ${lastPhotoId}`);
    // if (this.windowStart + this.windowSize >= this.photos.length) {
    //   await this.paginate();
    // }

    // const data = this.getWindow();

    // this.windowStart += this.windowSize;

    // return data;

    const photos = [];
    let retrieved = [];

    const partitions = this.queries.length + 1;
    const partitionSize = Math.floor(this.windowSize / partitions);
    logger.debug(
      `Paginating for ${partitions} partitions of ${partitionSize} size`
    );

    if (this.queries.length > 0) {
      const results = await Promise.all(
        this.queries.map((query) =>
          getRandomPhoto({ query, count: partitionSize })
        )
      );
      retrieved = results.map((p) => p.data).flat();
      logger.debug(
        `Retrieved ${this.queries.length} queries: ${retrieved.map(
          (r) => r.id
        )}`
      );

      results.forEach(({ rateLimit }) => this.updateRateLimit(rateLimit));
    }

    const remaining = this.windowSize - retrieved.length;

    const storedPhotos = await database.find(
      PhotoFeed.PHOTO_COLL,
      lastPhotoId ? { _id: { $gt: new ObjectID(lastPhotoId) } } : null,
      remaining
    );

    lastPhotoId = storedPhotos[storedPhotos.length - 1]._id;

    retrieved = retrieved.concat(storedPhotos);
    logger.debug(`Added paged photos: ${retrieved.map((r) => r.id)}`);

    retrieved.sort(() => Math.random() - 0.5);
    logger.debug(`Shuffled: ${retrieved.map((r) => r.id)}`);

    photos.push(...retrieved);
    logger.info(`Added ${retrieved.length} photos`);

    logger.debug(`Got ${photos.length} photos`);

    return { data: photos, lastPhotoId };
  }

  setWindow(window) {
    logger.debug(`Setting window size to ${window}`);
    this.windowSize = window;
  }
}

module.exports = PhotoFeed;
