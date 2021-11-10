const usersRouter = require('express').Router()
const User = require('../database/models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})

  return response.json(users)
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

  const userToAdd = {
    passwordHash,
    username: user.username
  }

  const newUser = new User({ ...userToAdd })
  try {
    const savedUser = await newUser.save()
    return response.status(200).json(savedUser.toObject())
  } catch (e) {
    return response.status(500).json({ error: 'User creation failed' })
  }
})



module.exports = usersRouter