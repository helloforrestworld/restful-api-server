const Koa = require('koa')
const path = require('path')
const koaBody = require('koa-body')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const app = new Koa()
const routing = require('./routes')
const { connectionStr } = require('./config')


mongoose.connect(connectionStr, { useNewUrlParser: true,  useUnifiedTopology: true  }, () => console.log('数据库连接成功...'))
mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`)
  process.exit(1);
});
mongoose.set('useFindAndModify', false)


app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}))
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),
    keepExtensions: true
  }
}))
app.use(parameter(app))
routing(app)

app.listen(8080, () => console.log('服务正在运行在3000端口...'))