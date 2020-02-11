const mongoose = require('mongoose')

const User = require('./User')
const Message = require('./Message')

const ConversationSchema = new mongoose.Schema({
  originalSenderId: String,
  originalRecipientId: String,
  status: String,
})

const Conversation = mongoose.model('Conversation', ConversationSchema)

module.exports = Conversation