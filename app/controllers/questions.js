const Question = require('../models/questions')
const User = require('../models/users')


class QuestionCtl {
  async find(ctx) {
    let { page = 1, pageSize = 10, q = '' } = ctx.query
    page = Math.max(page * 1, 1)
    pageSize = Math.max(pageSize * 1, 1)
    ctx.body = await Question.find({ $or: [{ title: new RegExp(q) }, { description: new RegExp(q) }] }).limit(pageSize).skip((page - 1) * pageSize)
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selected = fields.split(';').filter(filed => Boolean(filed.trim())).map(filed => `+${filed}`).join(' ')
    const question = await Question.findById(ctx.params.id).select(selected).populate('questioner topics')

    if (!question) {
      ctx.throw(404, '问题不存在')
    }

    ctx.body = question
  }

  async checkQuestionExist(ctx, next) {
    const question = await Question.findById(ctx.params.id).select('+questioner')

    if (!question) {
      ctx.throw(404, '问题不存在')
    }

    ctx.state.question = question
    await next()
  }


  async create(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
      topics: { type: 'array', itemType: 'string',  required: false }
    })

    const question = await new Question({ ...ctx.request.body, questioner: ctx.state.user._id }).save()
    ctx.body = question
  }

  async checkQuestioner(ctx, next) {
    const { question } = ctx.state

    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }

    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
      topics: { type: 'array', itemType: 'string',  required: false }
    })
    await ctx.state.question.update(ctx.request.body)
    ctx.body = ctx.state.question
  }

  async del(ctx) {
    await ctx.state.question.delete()
    ctx.status = 204
  }
}

module.exports = new QuestionCtl()