const mongoose = require('mongoose')
const faker = require('faker')
const config = require('../../utils/config')
const logger = require('../../utils/logger')
const Article = require('../models/article')
const User = require('../models/user')

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const getTags = (tags) => {
  let tagCount = random(1, 4)
  let tagsToReturn = []
  for (let i = 0; i < tagCount; i++) {
    tagsToReturn.push(tags[random(0, tags.length)])
  }
  return tagsToReturn
}

const seeder = async () => {
  await Promise.all([
    Article.deleteMany({}),
    User.deleteMany({})
  ])

  let articleAuthors = []

  let articleTags = [] // gets inserted with random tags
  for (let i = 0; i < 20; i++) {
    articleTags.push(faker.lorem.word(random(3, 8)))
  }
  let articlesToInsert = []
  for (let i = 0; i < 10; i++) {
    articleAuthors.push(new mongoose.Types.ObjectId())
  }
  for (let i = 0; i < 100; i++) {
    const objToAdd = {
      title: faker.lorem.words(random(2, 6)),
      content: `<p>${faker.lorem.paragraphs()}</p>`,
      author: articleAuthors[random(0, articleAuthors.length)],
      tags: getTags(articleTags)
    }
    articlesToInsert.push(new Article({ ...objToAdd }))
  }

  let authorsToInsert = []
  articleAuthors.forEach(a => {
    const objToAdd = {
      username: faker.name.findName()
    }
    authorsToInsert.push({ ...objToAdd, _id: a })
  })


  await Promise.all([
    Article.insertMany(articlesToInsert, (error) => { if (error) console.log(error) }),
    User.insertMany(authorsToInsert, (error) => { if (error) console.log(error) })
  ])
  console.log('seeded')
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