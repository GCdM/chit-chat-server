const sanitiseUser = (userObj) => {
  return {
    username: userObj.username,
    encPrivateKey: userObj.encPrivateKey,
  }
}

module.exports = {
  sanitiseUser,
}