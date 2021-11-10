const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../database/models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  if (!(body.password || body.username)) {
    return response.status(500).json({ error: 'User data missing' })
  }
  const user = await User.findOne({ username: body.username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'Incorrect username or password' })
  }
  const userForToken = {
    username: user.username,
    id: user.id
  }
  const token = jwt.sign(userForToken, process.env.SECRET)
  response.status(200).send({ token, username: user.username })
})

module.exports = loginRouter