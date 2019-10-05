const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/questions/:questionId/answers' })
const { find, findById, create, update, del, checkAnswerExist, checkAnswerQuestionId, checkAnswerer, listAnswerFollower } = require('../controllers/answers')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)

router.post('/', auth, create)

router.get('/:id', checkAnswerExist, checkAnswerQuestionId, findById)

router.patch('/:id', auth, checkAnswerExist, checkAnswerQuestionId, checkAnswerer, update)

router.delete('/:id', auth, checkAnswerExist, checkAnswerQuestionId, checkAnswerer, del)

router.get('/:id/followers', checkAnswerExist, checkAnswerQuestionId, listAnswerFollower)

module.exports = router