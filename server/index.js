/* eslint no-console: 0 */

const express = require('express');
const path = require('path');
const compression = require('compression');

const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../config/webpack.config');
const { shuffle } = require('./utils/helpers');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(compression());

const orderedCandidates = ['trump', 'vader', 'clinton'];
let connectCounter = 0;
let votes = [0, 0];
let shuffled = shuffle(orderedCandidates);
let candidates = [shuffled[0], shuffled[1]];

io.on('connection', (socket) => {
  connectCounter += 1;

  socket.emit('get-votes', { votes, connectCounter, candidates });

  socket.on('vote', (index) => {
    votes[index] += 1;
    io.emit('vote', votes);
  });

  socket.on('end-votes', () => {
    io.emit('end-votes');
  });

  socket.on('disconnect', () => {
    connectCounter -= 1;
    if (connectCounter === 0) {
      votes = [0, 0];
      shuffled = shuffle(orderedCandidates);
      candidates = [shuffled[0], shuffled[1]];
    }
  });
});

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 4000 : process.env.PORT;

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: '/',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  app.get('*', (req, res) => {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, '..', 'app', 'index.html')));
    res.end();
  });

  console.log('[App: App] initialized in Dev mode.');
} else {
  const STATIC_PATH = path.join(__dirname, '..', 'app');
  const STATIC_OPTS = {
    maxAge: 31536000000, // One year
  };

  app.use(express.static(STATIC_PATH, STATIC_OPTS));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'app', 'index.html'));
  });
  console.log('[App: App] initialized.');
}

http.listen(port, () => console.log(`[HTTP Server] Running at http://localhost:${port}`));

module.exports = app;
