const mongoose = require('mongoose')

const UserSchema = require('./UserSchema')
const ConversationSchema = require('./ConversationSchema')
const MessageSchema = require('./MessageSchema')

mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.catch( err => console.log('MongoDB Inital Connection Error: ', err) )

const User = new mongoose.model('User', UserSchema)
const Conversation = new mongoose.model('Conversation', ConversationSchema)
const Message = new mongoose.model('Message', MessageSchema)

User.prototype.myConversations = async function() {
  const testConvos = await Conversation.find({})
  
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

module.exports = {
  connection: mongoose.connection,
  User,
  Conversation,
  Message,
}