import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import { hca } from '../src/index'
import type { App } from './server'

const alova = createAlova({
  baseURL: 'http://localhost:3999',
  requestAdapter: adapterFetch(),
  responded: (response) => response.json(),
})

const client = hca<App>(alova)

const users = await client.users.alova.$get()

console.log(users)
