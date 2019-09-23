const Topic = require('../models/topics')
const User = require('../models/users')


class TopicCtl {
  async find(ctx) {
    let { page = 1, pageSize = 10, q = '' } = ctx.query
    page = Math.max(page * 1, 1)
    pageSize = Math.max(pageSize * 1, 1)
    ctx.body = await Topic.find({
      name: new RegExp(q)
    }).limit(pageSize).skip((page - 1) * pageSize)
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selected = fields.split(';').filter(filed => Boolean(filed.trim())).map(filed => `+${filed}`).join(' ')
    const topic = await Topic.findById(ctx.params.id).select(selected)

    if (!topic) {
      throw(404, '话题不存在')
    }

    ctx.body = topic
  }

  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })

    const topic = await new Topic(ctx.request.body).save()
    ctx.body = topic
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    try {
      const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
      ctx.body = topic
    } catch (err) {
      throw(404, '话题不存在')
    }
  }

  async checkExistTopic(ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) {
      ctx.throw(404, '话题不存在')
    }
    await next()
  }

  async listTopicFollower(ctx) {
    const users = await User.find({ followingTopics: ctx.params.id })
    ctx.body = users
  }
}

module.exports = new TopicCtl()