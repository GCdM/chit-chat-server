const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  originalSenderId: String,
  originalRecipientId: String,
  status: String,
})