const User = require('../db/User')

const sanitiseUser = (userObj) => {
  return {
    id: userObj.id,
    username: userObj.username,
    encPrivateKey: userObj.encPrivateKey,
  }
}

const sanitiseOtherUser = (userObj) => {
  return {
    id: userObj.id,
    username: userObj.username,
  }
}

const previewConversation = async (conversation, userId) => {
  const { originalSender, originalRecipient } = conversation
  const otherUserId = originalSender == userId ? originalRecipient : originalSender
  const otherUser = await User.findById(otherUserId)

  return {
    id: conversation.id,
    otherUsername: otherUser.username,
  }
}

module.exports = {
  sanitiseUser,
  sanitiseOtherUser,
  previewConversation,
}