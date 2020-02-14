const mongoose = require('mongoose')

const User = require('./User')
const Message = require('./Message')

const ConversationSchema = new mongoose.Schema({
    originalSender: {
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    originalRecipient: {
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    senderKey: String,
    recipientKey: String,
    messages: [{
      type: mongoose.ObjectId,
      ref: 'Message',
    }],
  },
  {
    timestamps: true,
  }
)

// ConversationSchema.pre('save', async function() {
//   debugger
//   const sender = await User.findOne({ id: this.originalSenderId })
//   const recipient = await User.findOne({ id: this.originalRecipientId })
  
//   debugger
  
//   const encSenderKey = ""
//   const encRecipientKey = ""
// })

const Conversation = mongoose.model('Conversation', ConversationSchema)

module.exports = Conversation