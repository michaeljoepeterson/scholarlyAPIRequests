require('dotenv').config();
const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const {PORT} = require('./config');

function runServer( port = PORT) {

  return new Promise((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`Your app is listening on port! ${port}`);
        resolve();
        fs.writeFile("/webProjects/scolarlyAPIRequests/data/test.txt", "Hey there!", function(err) {
          if(err) {
              return console.log(err);
          }

          console.log("The file was saved!");
      }); 
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };