const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  originalSenderId: Number,
  originalReceiverId: Number,
  status: String,
})