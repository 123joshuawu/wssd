require('dotenv').config();

const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');


const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

axios.defaults.baseURL = WEATHER_API_URL;

const app = express();

app.use(express.static('dist'));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('certificate.pem'),
};

app.get('/', (req, res) => {
  res.send({text: 'received'});
});

app.post('/getWeather', (req, res) => {
  let queryString = {};

  if (req.body.latitude && req.body.longitude) {
    queryString = { lat: req.body.latitude, lon: req.body.longitude };
  } else if (req.body.zipCode) {
    queryString = { zip: req.body.zipCode };
  } else if (req.body.cityName) {
    queryString = { q: req.body.cityName };
  } else if (req.body.units === undefined) {
    return res.status(400).send({code: 400, message: "Bad request"});
  }
  
  const params = Object.assign({
    units: req.body.units,
    APPID: WEATHER_API_KEY
  }, queryString);


  return Promise.all([
      axios.get('weather', { params }),
      axios.get('forecast', { params })
    ]).then((responses) => {
      const weather = responses[0].data;
      const forecast = responses[1].data;

      fs.writeFile('responseWeather.json', JSON.stringify(weather), 'utf-8', () => {});
      fs.writeFile('responseForecast.json', JSON.stringify(forecast), 'utf-8', () => {});

      res.send({ weather, forecast });
    }).catch((err) => {
      res.send({ err: err.response.data });
    });

  // res.send({
  //   weather: JSON.parse(fs.readFileSync('responseWeather.json')),
  //   forecast: JSON.parse(fs.readFileSync('responseForecast.json'))
  // });
});


https.createServer(httpsOptions, app).listen(3000, '0.0.0.0', () => {
  console.log('listening');
});
