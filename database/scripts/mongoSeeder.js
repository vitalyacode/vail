const mongoose = require('mongoose')
const faker = require('faker')
const config = require('../../utils/config')
const logger = require('../../utils/logger')
const bcrypt = require('bcrypt')
const Article = require('../models/article')
const User = require('../models/user')
const Comment = require('../models/comment')
const { random } = require('../../utils/helper')

const getTags = (tags) => {
  let tagCount = random(1, 4)
  let tagsToReturn = []
  for (let i = 0; i < tagCount; i++) {
    let rand = random(0, tags.length - 1)
    tagsToReturn.push(tags[rand])
  }
  return tagsToReturn
}

const seeder = async () => {
  await Promise.all([
    Article.deleteMany({}),
    User.deleteMany({}),
    Comment.deleteMany({})
  ])

  let articleAuthors = []

  let articleTags = [] // gets inserted with random tags
  for (let i = 0; i < 20; i++) {
    articleTags.push(faker.lorem.word(random(3, 8)))
  }
  let articlesToInsert = []
  for (let i = 0; i < 12; i++) {//fills with authors' ids
    articleAuthors.push(new mongoose.Types.ObjectId())
  }
  for (let i = 0; i < 120; i++) {//creates articles
    const objToAdd = {
      title: faker.lorem.words(random(2, 6)),
      content: `<p>${faker.lorem.paragraphs()}</p>`,
      author: articleAuthors[random(0, articleAuthors.length - 3)],//-3 cuz 2 custom users
      tags: getTags(articleTags)
    }
    articlesToInsert.push(new Article({ ...objToAdd }))
  }

  let authorsToInsert = []
  for (let i = 0; i < articleAuthors.length - 1; i++) {
    const password = faker.lorem.word(random(4, 10))
    const passwordHash = bcrypt.hashSync(password, 10)
    let articles = []
    for (let j = 0; j < 10; j++) {//fills users with articles
      articles.push(articlesToInsert[i * 10 + j])
    }
    const objToAdd = {
      username: faker.name.findName(),
      passwordHash,
      articles,
      likedArticles: []
    }
    authorsToInsert.push({ ...objToAdd, _id: articleAuthors[i] })
  }
  const adminHash = bcrypt.hashSync('admin', 10)
  const defaultUserHash = bcrypt.hashSync('defaultUser', 10)
  const admin = {
    username: 'admin',
    passwordHash: adminHash,
    role: 'admin'
  }
  const defaultUser = {
    username: 'defaultUser',
    passwordHash: defaultUserHash
  }
  authorsToInsert.push(admin)
  authorsToInsert.push(defaultUser)


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