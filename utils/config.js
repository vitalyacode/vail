require('dotenv').config()

const PORT = process.env.PORT || 3001

const MONGODB_URI = process.env.NODE_MODE === 'production'
  ? process.env.MONGODB_URI
  : process.env.TEST_MONGODB_URI

module.exports = {
  PORT,
  MONGODB_URI
}