const authRouter = require('express').Router()
const User = require('../database/models/user')
const { userExtractor } = require('../utils/middleware')

authRouter.get('/me', userExtractor, async (request, response) => {
  const userFromToken = request.user
  if (!userFromToken) return response.json({ error: 'Cannot decode token' })
  try {
    const user = await User.findById(userFromToken.id)
    return response.status(200).json(user)
  } catch (e) {
    return response.status(500).json('Cannot find user')
  }
})

module.exports = authRouter