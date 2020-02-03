if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const http = require('http')
// const https = require('https')
// const fs = require('fs')
// const io = require('socket.io')(server)
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const db = require('./src/db/db')
const UserSchema = require('./src/db/UserSchema')
const ConversationSchema = require('./src/db/ConversationSchema')
const MessageSchema = require('./src/db/MessageSchema')

///// CONFIGURE SSL/TLS /////
// const options = {
//   key: fs.readFileSync("./ssl/aliashost.key"),
//   cert: fs.readFileSync("./ssl/aliashost.crt"),
// }

// const server = https.createServer(options, app)
  
const app = express()
const server = http.Server(app)

///// SPIN UP SERVER /////
//////////////////////////
///// Handle database connection error
db.on('error', (err) => {
  console.log('MongoDB Connection Error: ', err)
})

///// Check that the databse connected succesfully
db.once('open', () => {
  console.log('MongoDB Connected!')

  
  ///// Listen on relevant port and initialise server
  server.listen(process.env['CHITCHAT_PORT'], () => {
    console.log(`Listening on port ${process.env['CHITCHAT_PORT']}`)
    serverInit()
  })
})

const serverInit = () => {
  ///// Create DB Models
  const User = new mongoose.model('User', UserSchema)
  const Conversation = new mongoose.model('Conversation', ConversationSchema)
  const Message = new mongoose.model('Message', MessageSchema)

  ///// MIDDLEWARES /////
  ///////////////////////
  ///// Set headers for CORS policy
  app.use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*')  
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    // res.header('Access-Control-Allow-Credentials', 'true') NEEDED FOR COOKIE BASED SESSION MANAGEMENT

    next()
  })

  app.use( express.json({ type: 'application/json' }) )

  ///// HTTP ROUTES /////
  ///////////////////////
  app.get('/status', (req, res) => {
    console.log("==> GET to /status")

    res.status(200).send({ status: "Up and running" })
  })

  app.post('/signup', (req, res) => {
    console.log("==> POST to /signup")
    // VALIDATE USERNAME IS UNIQUE AND PASSWORD IS SATISFACTORY

    const passwordDigest = bcrypt.hashSync(req.body.password, 12)

    User.create({ username: req.body.username, passwordDigest }, (err, newUser) => {
      if (err) res.status(400).send({
        message: "Could not create user",
        error: err
      })

      // REMEBER TO REMOVE PASSWORDDIGEST & ANYTHING UNNECESSARY
      newUser.passwordDigest = undefined
      newUser._v = undefined

      res.status(200).send( newUser )
    })
  })

  app.post('/login', (req, res) => {
    console.log("==> POST to /login")

    User.findOne({ username: req.body.username }, (err, user) => {
      const correctPassword = bcrypt.compareSync(req.body.password, user.passwordDigest)
      if (err || !correctPassword) return res.status(400).send({
        message: "Could not log in",
        error: "The username and password do not match any of our records"
      })

      // REMEBER TO REMOVE PASSWORDDIGEST & ANYTHING UNNECESSARY
      user.passwordDigest = undefined
      user._v = undefined

      res.status(200).send( user )
    })
  })
}
