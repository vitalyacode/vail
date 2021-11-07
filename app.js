const express = require('express')
const cors = require('cors')
const middleware = require('./utils/middleware')

const app = express()

app.use(cors)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
