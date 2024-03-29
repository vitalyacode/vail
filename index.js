const http = require('http')
const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

const mongoose = require('mongoose')
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info(`connected to MongoDB at ${config.MONGODB_URI}`)
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`) // delete later
})