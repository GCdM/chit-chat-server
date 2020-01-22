if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const session = require('./src/session')
const db = require('./src/db')