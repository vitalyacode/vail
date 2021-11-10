const articlesRouter = require('express').Router()
const { userExtractor } = require('../utils/middleware')
const Article = require('../database/models/article')
const User = require('../database/models/user')
const jwt = require('jsonwebtoken')

articlesRouter.get('/', async (request, response) => {
  try {
    const articles = await Article.find({}).populate('author', { username: 1 })
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

articlesRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user
  //change this when new properties of articles appear!!!
  if (!(body.title && body.content)) {
    //server-side article validation in addition to mongodb validation
    return response.status(400).json({ error: 'Title or content not provided' })
  }

  let userWhoAdds
  try {
    userWhoAdds = (await User.findById(user.id)).toObject()
  } catch (e) {
    response.status(500).json({ error: 'Provided user is not found' })
  }

  if (!userWhoAdds) {
    return response.status(500).json({ error: 'User from token not found' })
  }
  const articleToAdd = {
    title: body.title,
    content: body.content,
    author: userWhoAdds._id,
    tags: body.tags
  }
  let savedArticle
  try {
    savedArticle = await new Article({ ...articleToAdd }).save()
  } catch (e) {
    return response.status(500).json({ error: 'User from token not found' })
  }

  try {
    await User.findByIdAndUpdate(userWhoAdds._id,
      { ...userWhoAdds, articles: userWhoAdds.articles.concat(savedArticle._id) })
  } catch (e) {
    return response.status(500).json({ error: 'User update while creating article unsuccessfull' })
  }

  return response.json(savedArticle)
})

module.exports = articlesRouter