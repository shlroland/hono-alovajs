# hono-alovajs-client [![npm](https://img.shields.io/npm/v/hono-alovajs-client.svg)](https://npmjs.com/package/hono-alovajs-client)

[![Unit Test](https://github.com/shlroland/hono-alovajs-client/actions/workflows/unit-test.yml/badge.svg)](https://github.com/shlroland/hono-alovajs-client/actions/workflows/unit-test.yml)

[hono](https://github.com/honojs/hono) client for [alova](https://alova.js.org/zh-CN/)

[中文文档](./readme-zh.md)

Using [sxzz/ts-starter](https://github.com/sxzz/ts-starter) as the starter template

Features:

- Maintains the original client request method of `hono`
- Preserves type-safe hono rpc calling style
- Uses `alova` as the request library
- Supports all request strategy features of `alova`

## Installation

```bash
pnpm add hono-alovajs-client
```

## Usage

```ts
import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import { hac } from 'hono-alovajs-client'
import type { App } from './server'

const alova = createAlova({
  baseURL: 'http://localhost:3000',
  requestAdapter: adapterFetch(),
  responded: (response) => response.json(),
})

const client = hac<App>(alova)

const users = await client.users.$alova.$get()
```

### Notes

- To maintain compatibility with `hono`, currently only supports `alova`'s `fetch` adapter or custom `fetch` adapter
- Request methods like `Get` | `Post` | `Put` | `Delete` | `Head` | `Options` | `Patch` are provided by `alova`, while other methods like `url` are provided natively by `hono`

## License

[MIT](./LICENSE) License © 2025 [shlroland](https://github.com/shlroland)
