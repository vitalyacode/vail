const commentsRouter = require('express').Router()
const Comment = require('../database/models/comment')

commentsRouter.get('/', async (request, response) => {//only for development??

  try {
    const comments = await Comment.find({})
    return response.status(200).json(comments)
  } catch (e) {
    return response.status(403).json({ error: 'Can\'t find comments' })
  }

})

commentsRouter.get('/:id', async (request, response) => {//only for development??
  try {
    const comment = await Comment.findById(request.params.id)
    if (!comment) response.status(500).json({ error: 'No such comment in database' })
    return response.status(200).json(comment)
  } catch (e) {
    return response.status(403).json({ error: 'Can\'t find comment' })
  }
})

module.exports = commentsRouter