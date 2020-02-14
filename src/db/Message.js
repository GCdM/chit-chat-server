const mongoose = require('mongoose')

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

module.exports = mongoose.model('Message', MessageSchema)