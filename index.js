if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')

// const session = require('./src/session')
const db = require('./src/db/db')
const UserSchema = require('./src/db/UserSchema')
const ConversationSchema = require('./src/db/ConversationSchema')
const MessageSchema = require('./src/db/MessageSchema')

db.on('error', (err) => {
  console.log('MongoDB Connection Error: ', err)
})

///// SPIN UP SERVER /////
///// Check that the databse connected succesfully
db.once('open', () => {
  console.log('MongoDB Connected!')

  ///// Create DB Models
  const User = new mongoose.model('User', UserSchema)
  const Conversation = new mongoose.model('Conversation', ConversationSchema)
  const Message = new mongoose.model('Message', MessageSchema)

  ///// Listen on relevant port
  server.listen(process.env['CHITCHAT_PORT'], () => {
    console.log(`Listening on port ${process.env['CHITCHAT_PORT']}`)
  })
})

///// MIDDLEWARES /////

///// HTTP ROUTES /////

app.post('/login', (req, res) => {
  console.log("POST to /login")
  debugger

  const userData = { _id: 0, username: "Wrong" }
  
  res.status(200).send(userData)
})