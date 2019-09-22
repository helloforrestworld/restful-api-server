const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const { secret } = require('../config')


class UserCtl {
  async find(ctx) {
    let { page = 1, pageSize = 10, q = '' } = ctx.query
    page = Math.max(page * 1, 1)
    pageSize = Math.max(pageSize * 1, 1)
    ctx.body = await User.find({
      name: new RegExp(q)
    }).limit(pageSize).skip((page - 1) * pageSize)
  }
  async findById(ctx) {
    const { fields = '' } = ctx.query
    const blackList = ['password']

    const fieldsArr = fields.split(';').filter(field => Boolean(field.trim()) && blackList.indexOf(field) === -1)

    const selected = fieldsArr.map(field => `+${field}`).join(' ')

    const populated = fieldsArr.map(field => {
      if (field === 'employments') {
        return 'employments.company employments.job'
      }
      if (field === 'educations') {
        return 'educations.school educations.major'
      }
      return field
    }).join(' ')

    const user = await User.findById(ctx.params.id).select(selected).populate(populated)

    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    })

    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })

    if (repeatedUser) {
      ctx.throw(409, '用户已存在')
    }

    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false }
    })

    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)

    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  async del(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.status = 204
  }

  async login(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }
    })

    const user = await User.findOne(ctx.request.body)
    if (!user) {
      ctx.throw(401, '用户名或密码错误')
    }

    const { _id, name } = user
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
    ctx.body = { token }
  }

  async checkIsYourself(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  async checkIsOtherUser(ctx, next) {
    if (ctx.params.id === ctx.state.user._id) {
      ctx.throw(409, '用户信息冲突')
    }
    await next()
  }

  async listFollowing(ctx) {
    const users = await User.findById(ctx.params.id).select('+following').populate('following')

    if (!users) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = users.following
  }

  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    await next()
  }

  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  async unFollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  async listFollower(ctx) {
    const users = await User.find({ following: ctx.params.id })
    ctx.body = users
  }

  async listFollowingTopic(ctx) {
    const users = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')

    if (!users) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = users.followingTopics
  }

  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  async unFollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
}

module.exports = new UserCtl()