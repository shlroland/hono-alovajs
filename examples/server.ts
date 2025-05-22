import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

// 定义用户相关的 Zod schema
const UserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
})

// 定义更新用户的 schema（部分字段可选）
const UpdateUserSchema = UserSchema.partial()

// 定义用户类型
export type User = z.infer<typeof UserSchema>

// 定义请求配置类型
type RequestConfig = {
  timeout?: number
}

// 内存中的用户存储
const users: User[] = [
  {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 28,
  },
  {
    name: '李四',
    email: 'lisi@example.com',
    age: 32,
  },
  {
    name: '王五',
    email: 'wangwu@example.com',
    age: 25,
  },
  {
    name: '赵六',
    email: 'zhaoliu@example.com',
    age: 35,
  },
  {
    name: '孙七',
    email: 'sunqi@example.com',
    age: 29,
  },
]

// 创建 Hono 应用实例
const app = new Hono<{
  Variables: {
    config: RequestConfig
  }
}>()
  // GET /users - 获取所有用户
  .get('/users', (c) => {
    return c.json(users)
  })
  // GET /users/:id - 获取单个用户
  .get(
    '/users/:id',
    zValidator('param', z.object({ id: z.coerce.number() })),
    (c) => {
      const id = c.req.valid('param').id
      const user = users[id]
      if (!user) {
        return c.json({ error: '用户不存在' }, 404)
      }
      return c.json(user)
    },
  )
  // POST /users - 创建新用户
  .post('/users', zValidator('json', UserSchema), (c) => {
    const user = c.req.valid('json')
    users.push(user)
    return c.json({ message: '用户创建成功', user }, 201)
  })
  // PUT /users/:id - 更新用户
  .put('/users/:id', zValidator('json', UpdateUserSchema), (c) => {
    const id = Number.parseInt(c.req.param('id'))
    const updates = c.req.valid('json')

    if (!users[id]) {
      return c.json({ error: '用户不存在' }, 404)
    }

    users[id] = { ...users[id], ...updates }
    return c.json({ message: '用户更新成功', user: users[id] })
  })
  // DELETE /users/:id - 删除用户
  .delete('/users/:id', (c) => {
    const id = Number.parseInt(c.req.param('id'))
    if (!users[id]) {
      return c.json({ error: '用户不存在' }, 404)
    }

    users.splice(id, 1)
    return c.json({ message: '用户删除成功' })
  })

export type App = typeof app

serve({
  fetch: app.fetch,
  port: 3999,
})

console.log('Server is running on http://localhost:3999')
