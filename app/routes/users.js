const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/users' })
const { find, findById, create, update, del, login, checkIsYourself, listFollowing, listFollower, checkUserExist, checkIsOtherUser, follow, unFollow } = require('../controllers/users')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)
router.post('/', create)
router.get('/:id', findById)
router.patch('/:id', auth, checkIsYourself, update)
router.delete('/:id', auth, checkIsYourself, del)
router.post('/login', login)
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollower)
router.put('/following/:id', auth, checkIsOtherUser, checkUserExist, follow)
router.delete('/following/:id', auth, checkIsOtherUser, checkUserExist, unFollow)

module.exports = router