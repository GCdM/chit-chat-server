if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const app = require('express')()
const https = require('https')
const fs = require('fs')
// const io = require('socket.io')(server)
const mongoose = require('mongoose')

// const session = require('./src/session')
const db = require('./src/db/db')
const UserSchema = require('./src/db/UserSchema')
const ConversationSchema = require('./src/db/ConversationSchema')
const MessageSchema = require('./src/db/MessageSchema')

///// CONFIGURE SSL/TLS /////
const options = {
  key: fs.readFileSync("./ssl/localhost.key"),
  // key: fs.readFileSync("/srv/www/keys/my-site-key.pem"),
  cert: fs.readFileSync("./ssl/localhost.crt"),
  // cert: fs.readFileSync("/srv/www/keys/chain.pem"),
}

const server = https.createServer(options, app)

///// SPIN UP SERVER /////
//////////////////////////
///// Handle database connection error
db.on('error', (err) => {
  console.log('MongoDB Connection Error: ', err)
})

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
///////////////////////
///// Set headers for CORS policy
// app.use((req, res, next) => {
//   debugger
//   res.header('Access-Control-Allow-Origin', '*')  
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
//   res.header('Access-Control-Allow-Credentials', 'true')

//   next()
// })

///// HTTP ROUTES /////
///////////////////////
app.get('/status', (req, res) => {
  console.log("==> GET to /status")

  res.status(200).send({ status: "Up and running" })
})

app.post('/login', (req, res) => {
  console.log("==> POST to /login")
  debugger

  const userData = { _id: 0, username: "Fake" }
  
  res.status(200).send(userData)
})