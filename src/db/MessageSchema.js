const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  senderId: mongoose.ObjectId,
  content: String,
})
