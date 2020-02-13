const mongoose = require('mongoose')

const User = require('./User')
const Conversation = require('./Conversation')

const MessageSchema = new mongoose.Schema({
    senderId: mongoose.ObjectId,
    content: String,
  },
  {
    timestamps: true,
  }
)

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message