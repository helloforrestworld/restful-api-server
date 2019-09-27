const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/questions/:questionId/answers' })
const { find, findById, create, update, del, checkAnswerExist, checkAnswerer, listAnswerFollower } = require('../controllers/answers')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)

router.post('/', auth, create)

router.get('/:id', findById)

router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)

router.delete('/:id', auth, checkAnswerExist, checkAnswerer,  del)

router.get('/:id/followers', listAnswerFollower)

module.exports = router