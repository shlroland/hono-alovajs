# hono-alovajs-client [![npm](https://img.shields.io/npm/v/hono-alovajs-client.svg)](https://npmjs.com/package/hono-alovajs-client)

[![Unit Test](https://github.com/shlroland/hono-alovajs-client/actions/workflows/unit-test.yml/badge.svg)](https://github.com/shlroland/hono-alovajs-client/actions/workflows/unit-test.yml)

[hono](https://github.com/honojs/hono) 的 [alova](https://alova.js.org/zh-CN/) 客户端

使用 [sxzz/ts-starter](https://github.com/sxzz/ts-starter) 作为启动模板

功能点:

- 保留 `hono` 原有客户端请求方式不变
- 保留类型安全的 hono rpc 调用风格
- 使用 `alova` 作为请求库
- 支持 `alova` 所有请求策略功能


## 安装

```bash
pnpm add hono-alovajs-client
```

## 使用

```ts
import { hca } from 'hono-alovajs-client'
import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import type { App } from './server'

const alova = createAlova({
  baseURL: 'http://localhost:3000',
  requestAdapter: adapterFetch(),
  responded: (response) => response.json(),
})

const client = hca<App>(alova)

const users = await client.users.alova.$get()
```

### 注意事项

- 为保持与 `hono` 兼容，目前仅支持 `alova` 的 `fetch` 适配器或者自制的 `fetch` 适配器
-  `Get` | `Post` | `Put` | `Delete` | `Head` | `Options` | `Patch` 这些请求方法由 `alova` 提供，其余如 `url` 等方法由 `hono` 原生提供


## License

[MIT](./LICENSE) License © 2025 [shlroland](https://github.com/shlroland)
