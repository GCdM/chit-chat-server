if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const http = require('http')
// const https = require('https')
// const fs = require('fs')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const sessionCookie = require('client-sessions')

const db = require('./src/db/db')
const serialiser = require('./src/utils/serialiser')
const helper = require('./src/utils/helper')
const { pubPrivPairConfig } = require('./src/utils/configuration')

///// CONFIGURE SSL/TLS \\\\\
//\/\/\/\/\/\/\/\/\/\/\/\/\\\
// const options = {
//   key: fs.readFileSync('./ssl/aliashost.key'),
//   cert: fs.readFileSync('./ssl/aliashost.crt'),
// }

// const server = https.createServer(options, app)
  
const app = express()
const server = http.Server(app)

///// CONNECT TO DB \\\\\
//\/\/\/\/\/\/\/\/\/\/\\\
///// Handle database connection error
db.connection.on('error', (err) => {
  console.log('MongoDB Error: ', err)
})

///// Check that the databse connected succesfully
db.connection.once('open', () => {
  console.log('MongoDB Connected!')
  
  ///// Listen on relevant port and initialise server
  server.listen(process.env['CHITCHAT_PORT'], () => {
    console.log(`Listening on port ${process.env['CHITCHAT_PORT']}`)
    serverInit()
  })
})

///// SPIN UP SERVER \\\\\
//\/\/\/\/\/\/\/\/\/\/\/\\
const serverInit = () => {

  ///// MIDDLEWARES \\\\\
  //\/\/\/\/\/\/\/\/\/\\\
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
    // CONDUCT FURTHER CHECKS TO AVOID SESSION HIJACKING
    if (req.session.userId) {
      req.user = await db.User.findById(req.session.userId)
    }

    next()
  })

  ///// Logging / debugging middleware
  app.use((req, res, next) => {
    console.log('===>>>', req.method, '\t to ', req.path)
    // debugger
    next()
  })

  const loginRequired = (req, res, next) => {
    if (req.user) return next()

    res.status(403).send({
      error: "Login required",
      message: "You must be logged in access this route",
    })
  }

  ///// MISC ROUTES \\\\\
  //\/\/\/\/\/\/\/\/\/\\\
  app.get('/status', (req, res) => {
    res.status(200).send({ status: 'Up and running' })
  })

  ///// AUTH ROUTES \\\\\
  //\/\/\/\/\/\/\/\/\/\\\
  app.post('/signup', (req, res) => {
    // VALIDATE USERNAME IS UNIQUE AND PASSWORD IS SATISFACTORY
    const passwordDigest = bcrypt.hashSync(req.body.password, 12)

    db.User.create({ username: req.body.username, passwordDigest }, (err, newUser) => {
      if (err) res.status(400).send({
        message: 'Could not create user',
        error: err
      })
      
      req.session.userId = newUser.id
      ///// Generate RSA pub/priv key pair
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', pubPrivPairConfig)
      newUser.publicKey = publicKey
      newUser.encPrivateKey = helper.encryptData(privateKey, req.body.password)
      newUser.save()
      
      const sanitisedUser = serialiser.sanitiseUser(newUser)
      
      res.status(200).send( sanitisedUser )
    })
  })

  app.post('/login', (req, res) => {
    db.User.findOne({ username: req.body.username }, (err, user) => {
      let correctPassword
      if (user) correctPassword = bcrypt.compareSync(req.body.password, user.passwordDigest)

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

  ///// DATA ROUTES \\\\\
  //\/\/\/\/\/\/\/\/\/\\\
  app.get('/initial_data', loginRequired, async (req, res) => {
    const conversationPreviews = await req.user.myConversations()

    res.status(200).send({ conversationPreviews })
  })

  app.get('/other_users', loginRequired, async (req, res) => {
    const otherUsers = await req.user.otherUsers()

    res.status(200).send( otherUsers )
  })

  app.post('/start_conversation', loginRequired, async (req, res) => {
    const conversation = await req.user.startConversation(req.body.userId)

    res.status(200).send( conversation )
  })
}
