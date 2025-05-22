import type {
  AlovaGenerics,
  AlovaMethodConfig,
  Method,
  MethodRequestConfig,
  RespondedAlovaGenerics,
} from 'alova'
import type { FetchRequestInit } from 'alova/fetch'
import type { ClientRequestOptions, ClientResponse } from 'hono/client'
import type { HonoBase } from 'hono/hono-base'
import type { Endpoint, ResponseFormat, Schema } from 'hono/types'
import type { HasRequiredKeys } from 'hono/utils/types'

export type AlovaMethodCreateConfig<
  AG extends AlovaGenerics = AlovaGenerics,
  Responded = any,
  Transformed = any,
> = Partial<MethodRequestConfig> & AlovaMethodConfig<AG, Responded, Transformed>

type ClientResponseOfEndpoint<T extends Endpoint = Endpoint> = T extends {
  output: infer O
  outputFormat: infer F
  status: infer S
}
  ? ClientResponse<
    O,
    S extends number ? S : never,
    F extends ResponseFormat ? F : never
  >
  : never

type GetOutput<T extends Endpoint> = T extends {
  output: infer O
}
  ? O
  : never

export type ClientRequest<S extends Schema> = {
  [M in keyof S]: S[M] extends Endpoint & {
    input: infer R
  }
  ? R extends object
  ? HasRequiredKeys<R> extends true
  ? (
    args: R,
    options?: ClientRequestOptions,
  ) => Promise<ClientResponseOfEndpoint<S[M]>>
  : (
    args?: R,
    options?: ClientRequestOptions,
  ) => Promise<ClientResponseOfEndpoint<S[M]>>
  : never
  : never
} & {
  $url: (
    arg?: S[keyof S] extends {
      input: infer R
    }
      ? R extends {
        param: infer P
      }
      ? R extends {
        query: infer Q
      }
      ? {
        param: P
        query: Q
      }
      : {
        param: P
      }
      : R extends {
        query: infer Q
      }
      ? {
        query: Q
      }
      : {}
      : {},
  ) => URL
} & (S['$get'] extends {
  outputFormat: 'ws'
}
  ? S['$get'] extends {
    input: infer I
  }
  ? {
    $ws: (args?: I) => WebSocket
  }
  : {}
  : {}) & {
    $alova: {
      [M in keyof S]: S[M] extends Endpoint & {
        input: infer R
      }
      ? R extends object
      ? HasRequiredKeys<R> extends true
      ? <
        Transformed = GetOutput<S[M]>,
        Responded = GetOutput<S[M]>,
        AG extends AlovaGenerics<
          Responded,
          Transformed,
          FetchRequestInit,
          Response,
          Headers
        > = AlovaGenerics<
          Responded,
          Transformed,
          FetchRequestInit,
          Response,
          Headers
        >,
      >(
        args: R,
        config?: AlovaMethodCreateConfig<AG, Responded, Transformed>,
      ) => Method<RespondedAlovaGenerics<AG, Responded, Transformed>>
      : <
        Transformed = GetOutput<S[M]>,
        Responded = GetOutput<S[M]>,
        AG extends AlovaGenerics<
          Responded,
          Transformed,
          FetchRequestInit,
          Response,
          Headers
        > = AlovaGenerics<
          Responded,
          Transformed,
          FetchRequestInit,
          Response,
          Headers
        >,
      >(
        args?: R,
        config?: AlovaMethodCreateConfig<AG, Responded, Transformed>,
      ) => Method<RespondedAlovaGenerics<AG, Responded, Transformed>>
      : never
      : never
    }
  }

type PathToChain<
  Path extends string,
  E extends Schema,
  Original extends string = Path,
> = Path extends `/${infer P}`
  ? PathToChain<P, E, Path>
  : Path extends `${infer P}/${infer R}`
  ? { [K in P]: PathToChain<R, E, Original> }
  : {
    [K in Path extends '' ? 'index' : Path]: ClientRequest<
      E extends Record<string, unknown> ? E[Original] : never
    >
  }

export type Client<T> =
  T extends HonoBase<any, infer S, any>
  ? S extends Record<infer K, Schema>
  ? K extends string
  ? PathToChain<K, S>
  : never
  : never
  : never

export type Callback = (opts: CallbackOptions) => unknown

interface CallbackOptions {
  path: string[]

  args: any[]
}
