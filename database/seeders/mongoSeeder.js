const mongoose = require('mongoose')
const faker = require('faker')
const config = require('../../utils/config')
const logger = require('../../utils/logger')
const Article = require('../models/article')

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const seeder = async () => {
  await Promise.all([
    Article.deleteMany({})
  ])

  let articlesToInsert = []
  let articleAuthors = []
  for (let i = 0; i < 10; i++) {
    articleAuthors.push(new mongoose.Types.ObjectId())
  }
  for (let i = 0; i < 100; i++) {
    const objToAdd = {
      title: faker.lorem.words(),
      content: faker.lorem.paragraphs(),
      author: articleAuthors[random(0, articleAuthors.length)]
    }
    articlesToInsert.push(new Article({ ...objToAdd }))
  }

  await Article.insertMany(articlesToInsert, (error) => {
    console.log(error)
  })
}

const connect = async () => {
  await mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      logger.info(`connected to MongoDB at ${config.MONGODB_URI}`)
    })
    .catch((error) => {
      logger.error('error connection to MongoDB:', error.message)
    })
}
const wrapper = async () => {
  await connect()
  await seeder()
  console.log('database is made of seed')
  //process.exit()
  //await mongoose.connection.close()
}

wrapper()