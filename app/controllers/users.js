let db = [
  { name: '李大毛' }
]

class UserCtl {
  find(ctx) {
    ctx.body = db
  }
  findById(ctx) {
    ctx.body = db[ctx.params.id * 1] || {}
  }
  create(ctx) {
    db.push(ctx.request.body)
    ctx.body = ctx.request.body
  }
  update(ctx) {
    ctx.body = db[ctx.params.id * 1] = ctx.request.body
  }
  del(ctx) {
    db.splice(ctx.params.id * 1, 1)
    ctx.status = 204
  }
}

module.exports = new UserCtl()