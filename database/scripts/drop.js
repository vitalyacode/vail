const mongoose = require('mongoose')
const config = require('../../utils/config')
const logger = require('../../utils/logger')
const Article = require('../models/article')
const User = require('../models/user')

const drop = async () => {
  await mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      logger.info(`connected to MongoDB at ${config.MONGODB_URI}`)
    })
    .catch((error) => {
      logger.error('error connection to MongoDB:', error.message)
    })
  await Promise.all([
    Article.deleteMany({}),
    User.deleteMany({})
  ])
}

drop()