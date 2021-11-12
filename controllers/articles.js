const articlesRouter = require('express').Router()
const { userExtractor } = require('../utils/middleware')
const Article = require('../database/models/article')
const User = require('../database/models/user')
const Comment = require('../database/models/comment')
const { listenerCount } = require('../database/models/user')
//const { random } = require('../utils/helper')
//const jwt = require('jsonwebtoken')

articlesRouter.get('/', async (request, response) => {
  try {
    const articles = await Article.find({}, { likedBy: 0 }).populate('author', { username: 1 })
    return response.json(articles)
  } catch (e) {
    return response.status(500).json({ error: 'Database unresponding' })
  }
})

articlesRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  try {
    const article = await Article.findById(id, { likedBy: 0 })
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
  const articleToAdd = {//update when schema changes
    title: body.title,
    content: body.content,
    author: userWhoAdds._id,
    tags: body.tags,
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

articlesRouter.put('/:id/like', userExtractor, async (request, response) => {
  if (!request.params.id) return response.status(500).json({ error: 'Id of article not provided' })
  const userFromToken = request.user//used only to find User from database
  if (!userFromToken) return response.status(401).json({ error: 'Bad token provided' })
  let userWhoLikes
  try {
    userWhoLikes = await User.findById(userFromToken.id)
  } catch (e) {
    return response.status(500).json({ error: 'User from token not found' })
  }
  let articleToUpdate
  try {
    articleToUpdate = await Article.findById(request.params.id)
    if (!articleToUpdate) return response.status(404).json({ error: 'Article not found' })
  } catch (e) {
    return response.status(500).json({ error: 'Article to like not found' })
  }

  const type = request.body.type
  const userWhoLikesObj = userWhoLikes.toObject()

  if (type === 'addLike') {
    if (articleToUpdate.likedBy.includes(userWhoLikes._id)) {//both ids must be ObjectId
      return response.status(500).json({ error: 'User already liked this article' })
    }
    const likedArticle = {
      ...articleToUpdate._doc,
      likes: articleToUpdate.likes + 1,
      likedBy: articleToUpdate.likedBy.concat(userWhoLikes._id)
    }
    try {
      await User.findByIdAndUpdate(userWhoLikesObj._id, { ...userWhoLikesObj, likedArticles: userWhoLikesObj.likedArticles.concat(likedArticle._id || likedArticle.id) }, { new: true })
      const savedArticle = await Article.findByIdAndUpdate(likedArticle._id, { ...likedArticle }, { new: true, likedBy: 0 })
      return response.status(200).json(savedArticle)
    } catch (e) {
      return response.status(500).json({ error: 'Cannot update user or article' })
    }
  } else if (type === 'removeLike') { // removeLike scenario
    if (!articleToUpdate.likedBy.includes(userWhoLikes._id)) {//both ids must be ObjectId
      return response.status(500).json({ error: 'User haven\'t liked this article' })
    }
    const likedArticle = {
      ...articleToUpdate._doc,
      likes: articleToUpdate.likes - 1,
      likedBy: articleToUpdate.likedBy.filter(e => e.toString() !== userWhoLikes._id.toString())
    }
    try {
      await User.findByIdAndUpdate(userWhoLikesObj._id, { ...userWhoLikesObj, likedArticles: userWhoLikesObj.likedArticles.filter(e => e._id.toString() !== (likedArticle._id || likedArticle.id).toString()) }, { new: true })
      const savedArticle = await Article.findByIdAndUpdate(likedArticle._id, { ...likedArticle }, { new: true, likedBy: 0 })
      return response.status(200).json(savedArticle)
    } catch (e) {
      return response.status(500).json({ error: 'Cannot update user or article' })
    }

  } else {
    return response.status(400).json({ error: 'Incorrect type' })
  }

})

articlesRouter.post('/:id/comment', userExtractor, async (request, response) => {
  const body = request.body
  if (!request.params.id) return response.status(500).json({ error: 'Id of article not provided' })
  const userFromToken = request.user//used only to find User from database
  if (!userFromToken) return response.status(401).json({ error: 'Bad token provided' })
  if (!body.content) return response.status(400).json({ error: 'No content provided' })

  //toObject should be used when mongoose object is gonna be spreaded ...
  let userWhoComments, articleToComment
  try {
    await Promise.all([
      User.findById(userFromToken.id),
      Article.findById(request.params.id)
    ]).then(([user, article]) => {
      userWhoComments = user.toObject()
      articleToComment = article.toObject()
    })
    if (!userWhoComments) response.status(404).json({ error: 'User from token not found' })
    if (!articleToComment) return response.status(404).json({ error: 'Article not found' })
  } catch (e) {
    return response.status(500).json({ error: 'User or article not found' })
  }
  const commentToSave = {
    content: body.content
  }
  let comment
  try {
    comment = await new Comment({ ...commentToSave }).save()
  } catch (e) {
    return response.json({ error: 'Comment cannot be saved' })
  }

  const commentedArticle = {
    ...articleToComment,
    comments: articleToComment.comments.concat(comment._id)
  }
  const updatedUser = {
    ...userWhoComments,
    comments: userWhoComments.comments.concat(commentedArticle._id)
  }
  await Promise.all([
    User.findByIdAndUpdate(updatedUser._id, { ...updatedUser }),
    Article.findByIdAndUpdate(commentedArticle._id, { ...commentedArticle }, { new: true })
  ]).then(([user, article]) => {
    return response.status(200).json(article)
  })
})

module.exports = articlesRouter