const pubPrivPairConfig = {
  modulusLength: 2048,
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
}

module.exports = {
  pubPrivPairConfig,
}