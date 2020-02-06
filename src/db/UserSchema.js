const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  username: String,
  passwordDigest: String,
  publicKey: String,
})