const Answer = require('../models/answers')
const User = require('../models/users')


class AnswerCtl {
  async find(ctx) {
    let { page = 1, pageSize = 10, q = '' } = ctx.query
    page = Math.max(page * 1, 1)
    pageSize = Math.max(pageSize * 1, 1)
    ctx.body = await Answer.find({ content: new RegExp(q), questionId: ctx.params.questionId }).limit(pageSize).skip((page - 1) * pageSize)
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selected = fields.split(';').filter(filed => Boolean(filed.trim())).map(filed => `+${filed}`).join(' ')
    const answer = await Answer.findById(ctx.params.id).select(selected).populate('answerer')

    if (!answer) {
      ctx.throw(404, '回答不存在')
    }

    ctx.body = answer
  }

  async checkAnswerExist(ctx, next) {
    const answer = await Answer.findById(ctx.params.id).select('+answerer')

    if (!answer) {
      ctx.throw(404, '回答不存在')
    }

    ctx.state.answer = answer
    await next()
  }

  async checkAnswerQuestionId(ctx, next) {
    const answer = ctx.state.answer

    if (answer.questionId !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此回答')
    }

    await next()
  }


  async create(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
    })
    const answerer = ctx.state.user._id
    const questionId = ctx.params.questionId
    const answer = await new Answer({
      ...ctx.request.body,
      answerer,
      questionId
    }).save()
    ctx.body = answer
  }

  async checkAnswerer(ctx, next) {
    const { answer } = ctx.state

    if (answer.answerer.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }

    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true }
    })
    await ctx.state.answer.update(ctx.request.body)
    ctx.body = ctx.state.answer
  }

  async del(ctx) {
    await ctx.state.answer.delete()
    ctx.status = 204
  }

  async listAnswerFollower(ctx) {
    const users = await User.find({ followingAnswers: ctx.params.id })
    ctx.body = users
  }
}

module.exports = new AnswerCtl()