const mongoose = require('mongoose')

const Conversation = require('./Conversation')
const Message = require('./Message')

const serialiser = require('../utils/serialiser')

const UserSchema = new mongoose.Schema({
    username: String,
    passwordDigest: String,
    publicKey: String,
    encPrivateKey: String,
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', UserSchema)

const previewConversation = async (conversation, userId) => {
  const { originalSenderId, originalRecipientId } = conversation
  const otherUserId = originalSenderId == userId ? originalRecipientId : originalSenderId
  const otherUser = await User.findById(otherUserId)
  
  return {
    id: conversation.id,
    otherUsername: otherUser.username,
  }
}
///// Get all conversations for a user, whether or not they 
///// were the ones to start the conversation
User.prototype.myConversations = async function() {

  const conversations = await Conversation.find({})
  .or([{ originalRecipientId: this.id }, { originalSenderId: this.id }])
  .sort({ updatedAt: 'desc' })

  const conversationPreviewPromises = conversations.map( c => previewConversation(c, this.id) )

  return await Promise.all( conversationPreviewPromises )
}

User.prototype.otherUsers = async function() {
  
  const otherUsers = await User.find({ _id: { $ne: this._id } })

  return otherUsers.map( serialiser.sanitiseOtherUser )
}

User.prototype.startConversation = async function(userId) {

  const orOptions = [
    { originalSenderId: this.id, originalRecipientId: userId },
    { originalSenderId: userId, originalRecipientId: this.id },
  ]
  
  let conversation = await Conversation.findOne().or(orOptions)

  if (!conversation) conversation = await Conversation.create({ originalSenderId: this.id, originalRecipientId: userId })

  const conversationPreview = await previewConversation(conversation, this.id)
  
  return conversationPreview
}

module.exports = User