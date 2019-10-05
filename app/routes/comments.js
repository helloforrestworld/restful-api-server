const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/questions/:questionId/answers/:answerId/comments' })
const { find, findById, create, update, del, checkCommentExist, checkCommentQuestionId, checkCommentAnswerId, checkCommenter } = require('../controllers/comments')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)

router.post('/', auth, create)

router.get('/:id', checkCommentExist, checkCommentQuestionId, checkCommentAnswerId, findById)

router.patch('/:id', auth, checkCommentExist, checkCommentQuestionId, checkCommentAnswerId, checkCommenter, update)

router.delete('/:id', auth, checkCommentExist, checkCommentQuestionId, checkCommentAnswerId, checkCommenter, del)

module.exports = router