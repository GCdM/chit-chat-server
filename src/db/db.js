const mongoose = require('mongoose')


mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.catch( err => console.log('MongoDB Inital Connection Error: ', err) )

const User = require('./User')
const Conversation = require('./Conversation')
const Message = require('./Message')

module.exports = {
  connection: mongoose.connection,
  User,
  Conversation,
  Message,
}