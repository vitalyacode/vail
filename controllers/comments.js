const commentsRouter = require('express').Router()
const Comment = require('../database/models/comment')
const User = require('../database/models/user')
const middleware = require('../utils/middleware')

commentsRouter.get('/', middleware.commentKeyChecker, async (request, response) => {//only for development??

  try {
    const comments = await Comment.find({})
    return response.status(200).json(comments)
  } catch (e) {
    return response.status(403).json({ error: 'Can\'t find comments' })
  }

})

commentsRouter.get('/:id', middleware.commentKeyChecker, async (request, response) => {//only for development??
  try {
    const comment = await Comment.findById(request.params.id)
    if (!comment) response.status(500).json({ error: 'No such comment in database' })
    return response.status(200).json(comment)
  } catch (e) {
    return response.status(403).json({ error: 'Can\'t find comment' })
  }
})

commentsRouter.put('/:id/like', middleware.userExtractor, async (request, response) => {
  if (!request.params.id) return response.status(500).json({ error: 'Id of comment not provided' })
  const userFromToken = request.user//used only to find User from database
  if (!userFromToken) return response.status(401).json({ error: 'Bad token provided' })
  let userWhoLikes
  let commentToUpdate
  try {
    await Promise.all([
      User.findById(userFromToken.id),
      Comment.findById(request.params.id)
    ]).then(([user, article]) => {
      userWhoLikes = user.toObject()
      commentToUpdate = article.toObject()
    })
    if (!commentToUpdate) return response.status(404).json({ error: 'Article not found' })
    if (!userWhoLikes) return response.status(404).json({ error: 'User not found' })
  } catch (e) {
    return response.status(500).json({ error: 'User from token not found' })
  }

  const type = request.body.type

  if (type === 'addLike') {
    if (commentToUpdate.likedBy.find(e => e.toString() === userWhoLikes._id.toString())) {//both ids must be ObjectId
      return response.status(500).json({ error: 'User already liked this article' })
    }
    const likedComment = {
      ...commentToUpdate,
      likes: commentToUpdate.likes + 1,
      likedBy: commentToUpdate.likedBy.concat(userWhoLikes._id)
    }
    try {
      await Promise.all([
        Comment.findByIdAndUpdate(likedComment._id, { ...likedComment }, { new: true, likedBy: 0 }),
        User.findByIdAndUpdate(userWhoLikes._id, { ...userWhoLikes, likedComments: userWhoLikes.likedComments.concat(likedComment._id) }, { new: true })
      ]).then(([savedComment]) => {
        return response.status(200).json(savedComment)
      })
    } catch (e) {
      return response.status(500).json({ error: 'Cannot update user or comment' })
    }
  } else if (type === 'removeLike') {
    if (!commentToUpdate.likedBy.find(e => e.toString() === userWhoLikes._id.toString())) {//both ids must be ObjectId
      return response.status(500).json({ error: 'User haven\'t liked this comment' })
    }
    const likedComment = {
      ...commentToUpdate,
      likes: commentToUpdate.likes - 1,
      likedBy: commentToUpdate.likedBy.filter(e => e.toString() !== userWhoLikes._id.toString())
    }
    try {
      await Promise.all([
        Comment.findByIdAndUpdate(likedComment._id, { ...likedComment }, { new: true, likedBy: 0 }),
        User.findByIdAndUpdate(userWhoLikes._id, {
          ...userWhoLikes,
          likedComments: userWhoLikes.likedComments.filter(e => e.toString() !== likedComment._id.toString())
        }, { new: true })
      ]).then(([savedComment]) => {
        return response.status(200).json(savedComment)
      })
    } catch (e) {
      return response.status(500).json({ error: 'Cannot update user or comment' })
    }
  } else {
    return response.status(400).json({ error: 'Incorrect type' })
  }
})

module.exports = commentsRouter