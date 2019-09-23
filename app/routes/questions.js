const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/questions' })
const { find, findById, create, update, del, checkQuestionExist, checkQuestioner, listQuestionFollower } = require('../controllers/questions')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)

router.post('/', auth, create)

router.get('/:id', findById)

router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)

router.delete('/:id', auth, checkQuestionExist, checkQuestioner,  del)

router.get('/:id/followers', listQuestionFollower)

module.exports = router