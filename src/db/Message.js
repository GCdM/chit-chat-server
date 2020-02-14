const mongoose = require('mongoose')

const User = require('./User')
const Conversation = require('./Conversation')

const MessageSchema = new mongoose.Schema({
    sender: {
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message