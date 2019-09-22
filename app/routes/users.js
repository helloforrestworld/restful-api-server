const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/users' })
const { find, findById, create, update, del, login, checkOwner, listFollowing, listFollower, follow, unFollow } = require('../controllers/users')
const { secret } = require('../config')

const auth = jwt({ secret })

router.get('/', find)

router.post('/', create)

router.get('/:id', findById)

router.patch('/:id', auth, checkOwner, update)

router.delete('/:id', auth, checkOwner, del)

router.post('/login', login)

router.get('/:id/following', listFollowing)

router.get('/:id/followers', listFollower)

router.put('/following/:id', auth, follow)

router.delete('/following/:id', auth, unFollow)

module.exports = router