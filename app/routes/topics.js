const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/topics' })
const { find, findById, create, update, listTopicFollower, listTopicQuestion  } = require('../controllers/topics')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', findById)
router.patch('/:id', auth, update)
router.get('/:id/followers', listTopicFollower)
router.get('/:id/questions', listTopicQuestion)

module.exports = router