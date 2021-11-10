const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 2
  },
  content: {
    type: String,
    required: true,
    minLength: 2
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [
    {
      type: String
    }
  ],
  date: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  }
})

articleSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Article = mongoose.model('Article', articleSchema)

module.exports = Article