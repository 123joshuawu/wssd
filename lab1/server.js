const express = require('express');

var app = express();
app.use(express.static('public'));

app.listen(8080, '0.0.0.0', function () {
  console.log("listening");
});