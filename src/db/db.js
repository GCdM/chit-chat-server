const mongoose = require('mongoose')
const crypto = require('crypto')

const User = require('./User')
const Conversation = require('./Conversation')
const Message = require('./Message')
const serialiser = require('../utils/serialiser')

mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.catch( err => console.log('MongoDB Inital Connection Error: ', err) )

///// USER PROTO METHODS \\\\\
//\/\/\/\/\/\/\/\/\/\/\/\/\/\\
///// Get all conversations for a user
User.prototype.myConversations = async function() {

  const conversations = await Conversation.find({})
  .or([{ originalRecipient: this._id }, { originalSender: this._id }])
  .sort({ updatedAt: 'desc' })

  const conversationPreviewPromises = conversations.map( c => serialiser.previewConversation(c, this.id) )

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

///// CONVERSATION PROTO METHODS \\\\\
//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\
Conversation.prototype.calculateKeys = async function() {
  const sender = await User.findById(this.originalSender)
  const recipient = await User.findById(this.originalRecipient)
  
  const conversationPassword = crypto.randomBytes(128)
  
  const encSenderKey = crypto.publicEncrypt(sender.publicKey, conversationPassword).toString('hex')
  const encRecipientKey = crypto.publicEncrypt(recipient.publicKey, conversationPassword).toString('hex')

  this.senderKey = encSenderKey
  this.recipientKey = encRecipientKey
}

module.exports = {
  connection: mongoose.connection,
  User,
  Conversation,
  Message,
}