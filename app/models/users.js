const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  avatarUrl: { type: String },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  headline: { type: String },
  locations: {
    type: [{
      type: String
    }]
  },
  business: { type: String },
  employments: {
    type: [{
      company: { type: String },
      job: { type: String },
    }]
  },
  educations: {
    type: [{
      school: { type: String },
      major: { type: String },
      diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
      entranceYear: { type: Number },
      graduationYear: { type: Number }
    }]
  }
})

module.exports = model('User', userSchema)
