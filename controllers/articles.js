const articlesRouter = require('express').Router()
const Article = require('../database/models/article')
require('../database/models/user') //change when User is needed

articlesRouter.get('/', async (request, response) => {
  try {
    const articles = await Article.find({}).populate('author', { username: 1 })
    console.log(articles)
    return response.json(articles)
  } catch (e) {
    return response.status(500).json({ error: 'Database unresponding' })
  }
})

articlesRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  try {
    const article = await Article.findById(id)
    return response.json(article)
  } catch (e) {
    return response.status(500).json({ error: 'Article not found' })
  }
})

articlesRouter.post('/', async (request, response) => {
  const body = request.body

  return response.json(body)
})

module.exports = articlesRouter