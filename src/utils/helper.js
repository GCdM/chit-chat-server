const crypto = require('crypto')

const generateKey = (password) => {
  /* 
    Generate a 32bit key from a `password` string of any length by hashing it
  */
  return crypto.createHash('sha256')
          .update(password)
          .digest()
}

const generateIv = (ivString) => {
  /* 
    Generate an Initital Vector string from a plaintext `ivString` of any length by hashing it 
    to create a 32bit key, from which we copy the frist 16bits (as the IV needs to be 16bit)
  */
  const iv16Bytes = Buffer.allocUnsafe(16)
  const iv32Bytes = crypto.createHash('sha256')
                    .update(ivString)
                    .digest()

  iv32Bytes.copy(iv16Bytes)

  return iv16Bytes
}

const generateCipher = (password, ivString) => {
  /*
    Generate cipher from a 32bit `password` and 16bit `ivString`
  */
  return crypto.createCipheriv(
    'aes256', 
    generateKey(password),
    generateIv(ivString)
  )
}

const generateDecipher = (password, ivString) => {
  /*
    Generate decipher from a 32bit `password` and 16bit `ivString`
  */
  return crypto.createDecipheriv(
    'aes256', 
    generateKey(password),
    generateIv(ivString)
  )
}

const encryptData = (data, password) => {
  /*
    Takes in a `data` object and a `password` string

    Returns a hex string
  */

  const plainText = JSON.stringify(data)
  const cipher = generateCipher(password, "IdeallyCryptographicallyRandom")

  let encrypted = cipher.update(plainText, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return encrypted
}

const decryptData = (cipherText, password) => {
  /*
    Takes in a `cipherText` and a `password` string

    Returns the decrypted data as the original object
  */

  const decipher = generateDecipher(password, "IdeallyCryptographicallyRandom")

  let decrypted = decipher.update(cipherText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return JSON.parse(decrypted)
}

module.exports = {
  encryptData,
  decryptData,
}