const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')


class UserCtl {
  // 获取用户列表
  async find(ctx) {
    let { page = 1, pageSize = 10, q = '' } = ctx.query
    page = Math.max(page * 1, 1)
    pageSize = Math.max(pageSize * 1, 1)
    ctx.body = await User.find({
      name: new RegExp(q)
    }).limit(pageSize).skip((page - 1) * pageSize)
  }

  // 获取用户详情
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

  // 新建用户
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

  // 删除用户
  async del(ctx) {
    await User.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }


  // 登录
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

  // 必须操作用户自身， 如修改等
  async checkIsYourself(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }


  // 必须操作除自己外的用户，如关注等
  async checkIsOtherUser(ctx, next) {
    if (ctx.params.id === ctx.state.user._id) {
      ctx.throw(409, '用户信息冲突')
    }
    await next()
  }

  // 用户关注列表
  async listFollowing(ctx) {
    const users = await User.findById(ctx.params.id).select('+following').populate('following')

    if (!users) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = users.following
  }

  // 检测用户是否存在
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    await next()
  }

  // 关注用户
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消关注用户
  async unFollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 获取粉丝列表
  async listFollower(ctx) {
    const users = await User.find({ following: ctx.params.id })
    ctx.body = users
  }


  // 获取用户关注的话题列表
  async listFollowingTopic(ctx) {
    const users = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')

    if (!users) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = users.followingTopics
  }

  // 关注话题
  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消话题关注
  async unFollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 用户提问列表
  async listQuestion(ctx) {
    const questions = await Question.find({
      questioner: ctx.params.id
    })

    ctx.body = questions
  }

  // 关注问题
  async followQuestion(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingQuestions')
    if (!me.followingQuestions.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingQuestions.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消关注问题
  async unFollowQuestion(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingQuestions')
    const index = me.followingQuestions.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingQuestions.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 用户关注的问题列表
  async listFollowingQuestion(ctx) {
    const users = await User.findById(ctx.params.id).select('+followingQuestions').populate('followingQuestions')

    if (!users) {
      ctx.throw(404, '用户不存在')
    }

    ctx.body = users.followingQuestions
  }

  // 用户回答列表
  async listAnswer(ctx) {
    const answers = await Answer.find({
      answerer: ctx.params.id
    })

    ctx.body = answers
  }

  // 收藏回答
  async followAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingAnswers')
    if (!me.followingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
  }

  // 取消回答收藏
  async unFollowAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingAnswers')
    const index = me.followingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.followingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  // 用户收藏的回答列表
  async listFollowingAnswer(ctx) {
    const users = await User.findById(ctx.params.id).select('+followingAnswers').populate('followingAnswers')

    if (!users) {
      ctx.throw(404, '用户不存在')
    }

    ctx.body = users.followingAnswers
  }

  // 点赞过答案的列表
  async listLikingAnswer(ctx) {
    const users = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')

    if (!users) {
      ctx.throw(404, '用户不存在')
    }

    ctx.body = users.likingAnswers
  }

  // 点赞答案
  async likeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    }
    ctx.status = 204
    await next()
  }

  // 取消点赞答案
  async cancelLikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.likingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
    }
    ctx.status = 204
  }


  // 踩过答案的列表
  async listDisLikingAnswer(ctx) {
    const users = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')

    if (!users) {
      ctx.throw(404, '用户不存在')
    }

    ctx.body = users.dislikingAnswers
  }

  // 踩答案
  async disLikeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.dislikingAnswers.push(ctx.params.id)
      me.save()
    }
    ctx.status = 204
    await next()
  }

  // 取消踩答案
  async cancelDisLikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
}

module.exports = new UserCtl()