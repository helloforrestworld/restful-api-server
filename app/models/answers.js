const mongoose = require('mongoose')

const { Schema, model } = mongoose

const answerSchema = new Schema({
  __v: { type: Number, select: false },
  title: { type: String, required: true },
  description: { type: String },
  answerer: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false }
})

module.exports = model('Answer', answerSchema)
