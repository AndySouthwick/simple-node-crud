const jwt = require('jsonwebtoken');
const salt = require('./secrets')

 const isLoggedIn = (token) => {
  if(token) return jwt.verify(token, salt)
}
module.exports = isLoggedIn
