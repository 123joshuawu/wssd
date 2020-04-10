// const fs = require('fs');
const axios = require('axios').default;

const client = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    'Accept-Version': 'v1',
    Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`,
  },
});

// var fileData = [];

client.interceptors.response.use(
  ({ data, headers }) => {
    // fileData = fileData.concat(data);
    // fs.writeFile('wuj16-unsplash.json', JSON.stringify(fileData), () => {});

    return {
      data,
      rateLimit: {
        remaining: +headers['x-ratelimit-remaining'],
        total: +headers['x-ratelimit-limit'],
      },
      stats: {
        perPage: +headers['x-per-page'],
        total: +headers['x-total'],
      },
      link: headers['link'],
    };
  },
  ({
    response: {
      data: { errors },
      status: code,
      statusText: message,
    },
  }) => Promise.reject({ errors, code, message })
);

module.exports = {
  /** @param {Object.<string, any>} params
   *  @param {number} [params.page=1]
   *  @param {number} [params.per_page=10]
   *  @param {'latest'|'oldest'|'popular'} [params.order_by='latest']
   */
  getPhotos: (params) => client.get('/photos', { params }),

  /** @param {Object.<string, any>} params
   *  @param {string[]|string} params.collections
   *  @param {boolean} params.featured
   *  @param {string} params.username
   *  @param {string} params.query
   *  @param {'landscape'|'portrait'|'squarish'} params.orientation
   *  @param {number} params.count
   */
  getRandomPhoto: (params) => client.get('/photos/random', { params }),
};
