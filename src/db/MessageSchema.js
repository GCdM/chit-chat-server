const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  senderId: Number,
  content: String,
})
