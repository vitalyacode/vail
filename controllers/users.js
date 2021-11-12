const usersRouter = require('express').Router()
const User = require('../database/models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  return response.json(users)
})
usersRouter.get('/:id', async (request, response) => {
  try {
    const user = await User.findById(request.params.id)
    if (!user) response.status(404).json({ error: 'User not found' })
    return response.status(200).json(user)
  } catch (e) {
    return response.status(500).json({ error: 'User not found' })
  }
})

usersRouter.post('/signup', async (request, response) => {
  const user = request.body
  if (user.password.length < 5 || !user.password || user.password.length > 32) {
    return response.status(400).json({ error: 'Bad password' })
  }
  const userFromDB = await User.findOne({ username: user.username })
  if (userFromDB) return response.status(409).json({ error: 'Username taken' })
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(user.password, saltRounds)

  //creating token on registration, might delete later, unsafe?
  const userToAdd = {
    passwordHash,
    username: user.username
  }

  const newUser = new User({ ...userToAdd })
  try {
    const savedUser = await newUser.save()
    const userForToken = {
      username: savedUser.username,
      id: savedUser.id
    }
    const token = jwt.sign(userForToken, process.env.SECRET, { noTimestamp: true })
    return response.status(200).json({ user: savedUser.toObject(), token })
  } catch (e) {
    return response.status(500).json({ error: 'User creation failed' })
  }
})



module.exports = usersRouter