const Topic = require('../models/topics')


class TopicCtl {
  async find(ctx) {
    ctx.body = await Topic.find()
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
}

module.exports = new TopicCtl()