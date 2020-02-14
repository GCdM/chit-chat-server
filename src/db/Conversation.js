const mongoose = require('mongoose')

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

ConversationSchema.pre('save', async function() {
  if (this.isNew) await this.calculateKeys()
})

module.exports = mongoose.model('Conversation', ConversationSchema)