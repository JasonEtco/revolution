import React from 'react';
import { render } from 'react-dom';
import io from 'socket.io-client';
import App from './containers/App';
import './main.scss';

const socket = io();

render(<App socket={socket} />, document.querySelector('.mount'));
