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

module.exports = {
  sanitiseUser,
  sanitiseOtherUser,
}