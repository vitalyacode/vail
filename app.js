const express = require('express')
const cors = require('cors')
const middleware = require('./utils/middleware')

const articlesRouter = require('./controllers/articles')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const commentsRouter = require('./controllers/comments')

const app = express()

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)
//app.use(middleware.likedByCleaner)

app.use('/api/articles', articlesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/comments', commentsRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
