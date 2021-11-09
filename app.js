const express = require('express')
const cors = require('cors')
const middleware = require('./utils/middleware')

const articlesRouter = require('./controllers/articles')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/articles', articlesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
