const mongoose = require('mongoose')

const Conversation = require('./Conversation')
const Message = require('./Message')

const serialiser = require('../utils/serialiser')

const UserSchema = new mongoose.Schema({
  username: String,
  passwordDigest: String,
  publicKey: String,
  encPrivateKey: String,
})

const User = mongoose.model('User', UserSchema)

///// Get all conversations for a user, whether or not they 
///// were the ones to start the conversation
User.prototype.myConversations = async function() {

  const conversations = await Conversation.find({})
  .or([{ originalRecipientId: this.id }, { originalSenderId: this.id }])

  const conversationPreviewPromises = conversations.map( async conversation => {
    const { originalSenderId, originalRecipientId } = conversation
    const otherUserId = originalSenderId == this.id ? originalRecipientId : originalSenderId
    const otherUser = await User.findById(otherUserId)
    
    return {
      id: conversation.id,
      otherUsername: otherUser.username,
    }
  })

  return await Promise.all( conversationPreviewPromises )
}

User.prototype.otherUsers = async function() {
  
  const otherUsers = await User.find({ _id: { $ne: this._id } })

  return otherUsers.map( serialiser.sanitiseOtherUser )
}

module.exports = User