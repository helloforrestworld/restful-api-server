const Comment = require('../models/comments')
const Question = require('../models/questions')
const Answer = require('../models/answers')


class CommentCtl {
  async find(ctx) {
    let { page = 1, pageSize = 10, q = '', rootCommentId } = ctx.query
    page = Math.max(page * 1, 1)
    pageSize = Math.max(pageSize * 1, 1)
    let { questionId, answerId } = ctx.params
    ctx.body = await Comment.find({ content: new RegExp(q), questionId, answerId, rootCommentId }).limit(pageSize).skip((page - 1) * pageSize).populate('commentator replyTo')
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selected = fields.split(';').filter(filed => Boolean(filed.trim())).map(filed => `+${filed}`).join(' ')
    const comment = await Comment.findById(ctx.params.id).select(selected).populate('commentator')

    if (!comment) {
      ctx.throw(404, '评论不存在')
    }

    ctx.body = comment
  }

  async checkCommentExist(ctx, next) {
    const comment = await Comment.findById(ctx.params.id).select('+commentator')

    if (!comment) {
      ctx.throw(404, '评论不存在')
    }

    ctx.state.comment = comment
    await next()
  }

  async checkCommentQuestionId(ctx, next) {
    const comment = ctx.state.comment

    if (comment.questionId !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此评论')
    }

    await next()
  }

  async checkCommentAnswerId(ctx, next) {
    const comment = ctx.state.comment

    if (comment.answerId !== ctx.params.answerId) {
      ctx.throw(404, '该回答下没有此评论')
    }

    await next()
  }


  async create(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false }
    })
    const commentator = ctx.state.user._id
    const { questionId, answerId } = ctx.params

    const question = await Question.findById(questionId)

    if (!question) {
      ctx.throw(404, '问题不存在')
    }

    const answer = await Answer.findById(answerId)

    if (!answer) {
      ctx.throw(404, '回答不存在')
    }

    const comment = await new Comment({
      ...ctx.request.body,
      commentator,
      questionId,
      answerId
    }).save()
    ctx.body = comment
  }

  async checkCommenter(ctx, next) {
    const { comment } = ctx.state

    if (comment.commentator.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }

    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true }
    })
    const { content } = ctx.request.body
    await ctx.state.comment.update({ content })
    ctx.body = ctx.state.comment
  }

  async del(ctx) {
    await ctx.state.comment.delete()
    ctx.status = 204
  }
}

module.exports = new CommentCtl()