const mongoose = require('mongoose')

const Conversation = require('./Conversation')
const Message = require('./Message')

const serialiser = require('../utils/serialiser')

const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    passwordDigest: {
      type: String,
      required: true,
      unique: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    encPrivateKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', UserSchema)

const previewConversation = async (conversation, userId) => {
  const { originalSender, originalRecipient } = conversation
  const otherUserId = originalSender == userId ? originalRecipient : originalSender
  const otherUser = await User.findById(otherUserId)
  debugger
  return {
    id: conversation.id,
    otherUsername: otherUser.username,
  }
}

///// Get all conversations for a user, whether or not they 
///// were the ones to start the conversation
User.prototype.myConversations = async function() {

  const conversations = await Conversation.find({})
  .or([{ originalRecipient: this._id }, { originalSender: this._id }])
  .sort({ updatedAt: 'desc' })

  const conversationPreviewPromises = conversations.map( c => previewConversation(c, this.id) )

  return await Promise.all( conversationPreviewPromises )
}

///// Get all users except for `this` (/"self")
User.prototype.otherUsers = async function() {
  
  const otherUsers = await User.find({ _id: { $ne: this._id } })

  return otherUsers.map( serialiser.sanitiseOtherUser )
}

///// Find existing conversation, otherwise create new one
User.prototype.startConversation = async function(userId) {

  const orOptions = [
    { originalSender: this.id, originalRecipient: userId },
    { originalSender: userId, originalRecipient: this.id },
  ]
  
  let conversation = await Conversation.findOne().or(orOptions)

  if (!conversation) conversation = await Conversation.create({ originalSender: this.id, originalRecipient: userId })

  const conversationPreview = await previewConversation(conversation, this.id)
  
  return conversationPreview
}

module.exports = User