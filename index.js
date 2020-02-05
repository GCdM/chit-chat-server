if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const http = require('http')
// const https = require('https')
// const fs = require('fs')
// const io = require('socket.io')(server)
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const sessionCookie = require('client-sessions')

const db = require('./src/db/db')
const UserSchema = require('./src/db/UserSchema')
const ConversationSchema = require('./src/db/ConversationSchema')
const MessageSchema = require('./src/db/MessageSchema')
const serialiser = require('./src/serialiser')

///// CONFIGURE SSL/TLS /////
/////////////////////////////
// const options = {
//   key: fs.readFileSync('./ssl/aliashost.key'),
//   cert: fs.readFileSync('./ssl/aliashost.crt'),
// }

// const server = https.createServer(options, app)
  
const app = express()
const server = http.Server(app)

///// CONNECT TO DB /////
/////////////////////////
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

///// SPIN UP SERVER /////
//////////////////////////
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

    next()
  })

  ///// JSON body parser
  app.use( express.json({ type: 'application/json' }) )

  ///// Encrypted session cookie manager
  app.use(sessionCookie({
    cookieName: 'id',
    requestKey: 'session',
    secret: process.env['CHITCHAT_SESSION_SECRET'],
    duration: 1000 * 60 * 30, // 30min
    activeDuration: 1000 * 60 * 5, // 5min
    cookie: {
      httpOnly: true,
      // secure: true, ENABLE WHEN USING HTTPS
      // ephemeral: true, SET FOR HEAVY SECURITY (LOGGING THE USER OUT EACH TIME THEY CLOSE THE APP)
    },
  }))

  ///// Load user into session
  app.use(async (req, res, next) => {
    // Conduct further checks to prevent session hijacking
    if (req.session.userId) {
      req.user = await User.findById(req.session.userId)
    }

    next()
  })

  ///// Logging / debugging middleware
  app.use((req, res, next) => {
    console.log('===>>>', req.method, ' to ', req.path)
    // debugger
    next()
  })

  ///// HTTP ROUTES /////
  ///////////////////////
  app.get('/status', (req, res) => {
    res.status(200).send({ status: 'Up and running' })
  })

  app.post('/signup', (req, res) => {
    // VALIDATE USERNAME IS UNIQUE AND PASSWORD IS SATISFACTORY
    const passwordDigest = bcrypt.hashSync(req.body.password, 12)

    User.create({ username: req.body.username, passwordDigest }, (err, newUser) => {
      if (err) res.status(400).send({
        message: 'Could not create user',
        error: err
      })

      req.session.userId = user.id
      const sanitisedUser = serialiser.sanitiseUser(user)

      res.status(200).send( sanitisedUser )
    })
  })

  app.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
      const correctPassword = bcrypt.compareSync(req.body.password, user.passwordDigest)
      if (err || !correctPassword) return res.status(400).send({
        error: 'Could not log in',
        message: 'Username and password do not match any of our records',
      })

      req.session.userId = user.id
      const sanitisedUser = serialiser.sanitiseUser(user)

      res.status(200).send( sanitisedUser )
    })
  })

  app.get('/logout', (req, res) => {
    req.session.destroy()

    res.status(200).send({ message: "Logged out" })
  })

  app.get('/validate', (req, res) => {
    if (req.user) {
      const sanitisedUser = serialiser.sanitiseUser(req.user)

      res.status(200).send( sanitisedUser )
    } else {
      res.status(401).send({
        error: 'Not logged in',
        message: 'Session is unauthenticated or expired',
      })
    }
  })
}
