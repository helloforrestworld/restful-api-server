
# RESTFUL API

- Representational State Transfer

  - Representational 数据表现形式
  - State 当前状态或者数据
  - Transfer 数据传输

- 六个限制

  - 客户-服务器（Client-Server）
  - 无状态
  - 缓存(所有服务端响应都要被标为可缓存或者不可缓存)
  - 统一接口*
    1.接口设计尽可能通用
  - 分层系统
    1. 每层知道相邻一层
    2. 客户端不知道是和代码还是真实服务器通信
    3. 其它层： 安全层、负载均衡、缓存层
  - 按需代码
    1.客户端可以下载运行服务端传来的代码(比如JS)

# koa

- 洋葱模型

## koa-router

- 多中间件

- HTTP options方法作用
  - 检测服务器所支持的方法
  - CORS中的预检请求

- allowedMethods
  - 响应options方法
  - 相应地返回405(不允许) 和 501(没实现)

# 编写控制器

- 获取HTTP请求
  - ctx.query
  - ctx.params
  - ctx.header
  - ctx.request.body

- 发送HTTP响应
  - ctx.body
  - ctx.status
  - ctx.set('key', value)

- 最佳实践
  - 每个资源的控制器放在不同文件
  - 尽量使用类+类的方法的形式编写控制器
  - 严谨的错误处理

# 错误处理

- koa自带的错误处理404 500
- 其他错误处理
  - 412(先决条件失败)

- 编写错误处理中间件

- 使用第三方中间件koa-json-error
  - 修改配置使其在生产环境下禁用错误堆栈的返回

- 使用koa-parameter校验参数

# 数据库

- NoSQL数据库的分类
  - 列存储(HBase)
  - 文档存储(MongoDB)
  - Key-value存储(Redis)
  - 图存储(FlockDB)
  - 对象存储(db4o)
  - XML存储(BaseX)

- MongoDB
  - 性能好(内存计算)
  - 大规模数据存储(可拓展性)
  - 可靠安全(本地复制、自动故障转移)
  - 方便存储复杂的数据结构(Schema Free)

- 云MongoDB
  1.注册用户
  2.创建集群
  3.添加数据用户
  4.设置IP地址白名单
  5.获取连接地址
