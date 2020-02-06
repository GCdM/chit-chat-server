const sanitiseUser = (userObj) => {
  return {
    username: userObj.username,
  }
}

module.exports = {
  sanitiseUser,
}