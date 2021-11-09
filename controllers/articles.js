const articlesRouter = require('express').Router()
const Article = require('../database/models/article')

articlesRouter.get('/', async (request, response) => {
  const articles = await Article.find({})

  response.json(articles)
})

module.exports = articlesRouter