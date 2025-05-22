import type { Alova, AlovaGenerics } from "alova"
import type { FetchRequestInit } from "alova/fetch"
import type { ClientRequestOptions } from "hono"
import type { HonoBase } from "hono/hono-base"
import type { UnionToIntersection } from "hono/utils/types"
import { AlovaRequestImpl, ClientRequestImpl } from "./request-impl"
import type { Callback, Client } from "./types"
import { mergePath, replaceUrlParam, buildSearchParams, upperMethodFirstLetter, replaceUrlProtocol, deepMerge } from "./utils"

const createProxy = (callback: Callback, path: string[]) => {
  const proxy: unknown = new Proxy(() => { }, {
    get(_obj, key) {
      if (typeof key !== 'string' || key === 'then') {
        return undefined
      }
      return createProxy(callback, [...path, key])
    },
    apply(_1, _2, args) {
      return callback({
        path,
        args,
      })
    },
  })
  return proxy
}

export const hca = <
  T extends HonoBase<any, any, any>,
  A extends Alova<
    AlovaGenerics<any, any, FetchRequestInit, Response, Headers>
  > = Alova<AlovaGenerics<any, any, FetchRequestInit, Response, Headers>>,
>(
  alova: A,
  options?: ClientRequestOptions,
) =>
  createProxy(function proxyCallback(opts) {
    const parts = [...opts.path]
    const lastParts = parts.slice(-3).reverse()

    // allow calling .toString() and .valueOf() on the proxy
    if (lastParts[0] === 'toString') {
      if (lastParts[1] === 'name') {
        // e.g. hc().somePath.name.toString() -> "somePath"
        return lastParts[2] || ''
      }
      // e.g. hc().somePath.toString()
      return proxyCallback.toString()
    }

    if (lastParts[0] === 'valueOf') {
      if (lastParts[1] === 'name') {
        // e.g. hc().somePath.name.valueOf() -> "somePath"
        return lastParts[2] || ''
      }
      // e.g. hc().somePath.valueOf()
      return proxyCallback
    }

    let method = ''
    if (/^\$/.test(lastParts[0] as string)) {
      const last = parts.pop()
      if (last) {
        method = last.replace(/^\$/, '')
      }
    }

    const baseUrl = alova.options.baseURL || '/'
    const path = parts.join('/')
    const url = mergePath(baseUrl, path)

    if (method === 'url') {
      let result = url
      if (opts.args[0]) {
        if (opts.args[0].param) {
          result = replaceUrlParam(url, opts.args[0].param)
        }
        if (opts.args[0].query) {
          result = `${result}?${buildSearchParams(opts.args[0].query).toString()}`
        }
      }
      return new URL(result)
    }

    const penultimate = lastParts[1]

    if (penultimate === 'alova' && method) {
      const alovaMethod = upperMethodFirstLetter(method)
      const path = parts.slice(0, -1).join('/')

      const alovaRequest = new AlovaRequestImpl(path, alovaMethod, alova)
      return alovaRequest.apply(opts.args[0], opts.args[1], options)
    }

    if (method === 'ws') {
      const webSocketUrl = replaceUrlProtocol(
        opts.args[0] && opts.args[0].param
          ? replaceUrlParam(url, opts.args[0].param)
          : url,
        'ws',
      )
      const targetUrl = new URL(webSocketUrl)

      const queryParams: Record<string, string | string[]> | undefined =
        opts.args[0]?.query
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => targetUrl.searchParams.append(key, item))
          } else {
            targetUrl.searchParams.set(key, value)
          }
        })
      }
      const establishWebSocket = (
        ...args: ConstructorParameters<typeof WebSocket>
      ) => {
        if (
          options?.webSocket !== undefined &&
          typeof options.webSocket === 'function'
        ) {
          return options.webSocket(...args)
        }
        return new WebSocket(...args)
      }

      return establishWebSocket(targetUrl.toString())
    }

    const req = new ClientRequestImpl(url, method)
    if (method) {
      options ??= {}
      const args = deepMerge<ClientRequestOptions>(options, { ...opts.args[1] })
      return req.fetch(opts.args[0], args)
    }
    return req
  }, []) as UnionToIntersection<Client<T>>
