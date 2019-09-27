const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/users' })
const { find, findById, create, update, del, login, checkIsYourself, listFollowing, listFollower, checkUserExist, checkIsOtherUser, follow, unFollow, listFollowingTopic, followTopic, unFollowTopic, listQuestion, followQuestion, unFollowQuestion, listFollowingQuestion, listAnswer, followAnswer, unFollowAnswer, listFollowingAnswer } = require('../controllers/users')
const { checkExistTopic } = require('../controllers/topics')
const { checkQuestionExist } = require('../controllers/questions')
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

router.get('/:id/followingTopics', listFollowingTopic)

router.put('/followingTopic/:id', auth, checkExistTopic, followTopic)

router.delete('/followingTopic/:id', auth, checkExistTopic, unFollowTopic)

router.get('/:id/questions', listQuestion)

router.put('/followingQuestion/:id', auth, checkQuestionExist, followQuestion)

router.delete('/followingQuestion/:id', auth, checkQuestionExist, unFollowQuestion)

router.get('/:id/followingQuestions', listFollowingQuestion)

router.get('/:id/answers', listAnswer)

router.put('/followingAnswer/:id', auth, checkAnswerExist, followAnswer)

router.delete('/followingAnswer/:id', auth, checkAnswerExist, unFollowAnswer)

router.get('/:id/followingAnswers', listFollowingAnswer)

module.exports = router