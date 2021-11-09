const articlesRouter = require('express').Router()
const Article = require('../database/models/article')
require('../database/models/user') //change when User is needed

articlesRouter.get('/', async (request, response) => {
  try {
    const articles = await Article.find({}).populate('author', { username: 1 })
    return response.json(articles)
  } catch (e) {
    return response.status(500).json({ error: 'Database unresponding' })
  }
})

module.exports = articlesRouter