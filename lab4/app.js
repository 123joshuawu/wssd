var serverStarted = false;

// Load environmental variables from .env file
const envResult = require('dotenv').config();

// Logging
const pino = require('pino');
const expressPino = require('express-pino-logger');

// Loggers
// Main application logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: null,
});
// Flushes every log, useful for logging near process completion
const finalLogger = pino.final(logger);

// If dotenv failed to load environmental variables, throw error
if (envResult.error) {
  logger.error(`Failed to load .env configuration: ${envResult.error.message}`);
  throw envResult.error;
}

const path = require('path');
const util = require('util');

const { getPhotos } = require('./services/UnsplashService');

// MongoDB
const database = require('./database');

const initPhotos = () => {
  database.init().then(async () => {
    const currentPhotos = await database.find('photos');
    logger.debug(
      `Currently ${currentPhotos.length} photos are stored in database`
    );
    // if (currentPhotos.length == 0) {
    //   const { data } = await getPhotos({ per_page: 20 });
    //   logger.debug(`Adding ${data.length} photos to the database`);
    //   await database.save('photos', data);
    // }
  });
};
initPhotos();

// Express
const http = require('http');
const express = require('express');

// Socket.io
const sio = require('socket.io');

// Setup ExpressJS
const app = express();

if (process.env.NODE_ENV === 'development' && process.env.LOG_EXPRESS === '1')
  app.use(expressPino({ logger }));

if (process.env.NODE_ENV === 'production')
  app.use(express.static(path.join(__dirname, 'photoApp', 'dist', 'photoApp')));

if (process.env.NODE_ENV === 'development') {
  app.use(require('cors')());
}

// json -> csv
const { Parser } = require('json2csv');

const json2csv = new Parser();

// json -> xml
const js2xml = require('js2xmlparser');

// Routes
app.get('/export', async (req, res) => {
  const { format } = req.query;

  try {
    const data = await database.find('photos');
    if (format === 'json') {
      res.send(data);
    } else if (format === 'csv') {
      res.send(json2csv.parse(data));
    } else if (format === 'xml') {
      res.send(js2xml.parse('photos', data, { replaceInvalidChars: true }));
    } else {
      res.status(400).send('Unknown format');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// HTTP server
const server = http.createServer({}, app);

// Socket.io server
const io = sio(server);

// Start HTTP server
server.listen(process.env.EXPRESS_PORT, process.env.EXPRESS_HOST, () => {
  logger.info(
    `API listening at ${process.env.EXPRESS_HOST}:${process.env.EXPRESS_PORT}`
  );
  serverStarted = true;
});

// Import PhotoFeed controller
const PhotoFeed = require('./controllers/PhotoFeed.js');

// Socket.io Handlers
io.on('connection', (socket) => {
  logger.debug('Received connection');
  let feed = new PhotoFeed();

  // feed
  // .paginate()
  // .then(() => {
  // return feed.getWindow();
  // })
  // .getNext()
  // .then((photos) => {
  // fs.appendFile('photos.js', JSON.stringify(photos), (err) => {logger.debug(`added to photos ${err}`)});
  // socket.emit('feed', photos);
  // })
  // .catch((err) => {
  // if (err.errors) {
  // socket.emit('errorMsg', { err });
  // }
  // });

  socket.on('next', ({ lastPhotoId }) => {
    feed
      .getNext(lastPhotoId)
      .then((photos) => {
        // fs.appendFile('photos.js', JSON.stringify(photos), (err) => {logger.debug(`added to photos ${err}`)});
        socket.emit('feed', photos);
      })
      .catch((err) => {
        if (err.errors) {
          socket.emit('errorMsg', { err });
        }
      });
  });

  socket.on('query', async (queryUpdate) => {
    try {
      await feed.updateQueries(queryUpdate);
    } catch (err) {
      if (err.errors) {
        socket.emit('errorMsg', { queryUpdate, err });
      }
    }
  });

  socket.on('window', ({ window }) => {
    feed.setWindow(window);
  });

  socket.on('reset', async () => {
    logger.warn('got reset');
    await database.reset();

    initPhotos();
  });
});

// Ensure all processes are wrapped up on process exit
async function cleanUp(exitCode) {
  finalLogger.debug('Cleanup called');

  try {
    if (server !== null && serverStarted) {
      Object.values(io.sockets.sockets).forEach((s) => s.disconnect());
      await util.promisify(server.close.bind(server))();
      finalLogger.debug('Server closed');
    }
    if (database) {
      database.cleanup();
      finalLogger.debug('MongoClient closed');
    }

    finalLogger.debug('Cleanup complete, exiting...');
    process.exit(exitCode);
  } catch (err) {
    finalLogger.debug(`Failed to exit: ${err}`);
    process.abort();
  }
}

// Nodemon reload signal
process.on('SIGUSR2', async () => {
  finalLogger.debug('Restart signal received');
  await cleanUp(0);
});

process.on('SIGINT', async () => {
  finalLogger.info('Keyboard interrupt');
  await cleanUp(0);
});

process.on('uncaughtException', async (err, origin) => {
  finalLogger.error(`${origin}: ${err}`);
  await cleanUp(1);
});
