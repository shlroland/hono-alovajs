export const upperMethodFirstLetter = (
  str: string,
): 'Get' | 'Post' | 'Put' | 'Delete' | 'Head' | 'Options' | 'Patch' => {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as
    | 'Get'
    | 'Post'
    | 'Put'
    | 'Delete'
    | 'Head'
    | 'Options'
    | 'Patch'
}

// the functions below are copied from hono

export const mergePath = (base: string, path: string) => {
  base = base.replace(/\/+$/, '')
  base = `${base}/`
  path = path.replace(/^\/+/, '')
  return base + path
}

export type ObjectType<T = unknown> = {
  [key: string]: T
}

function isObject(item: unknown): item is ObjectType {
  return typeof item === 'object' && item !== null && !Array.isArray(item)
}

export function deepMerge<T>(target: T, source: Record<string, unknown>): T {
  if (!isObject(target) && !isObject(source)) {
    return source as T
  }

  // @ts-expect-error ignore type error, this function is copied from hono
  const merged: ObjectType<T> = { ...target }

  // eslint-disable-next-line no-restricted-syntax
  for (const key in source) {
    const value = source[key]
    if (isObject(merged[key]) && isObject(value)) {
      merged[key] = deepMerge(merged[key], value)
    } else {
      merged[key] = value as T[keyof T] & T
    }
  }

  return merged as T
}

export const removeIndexString = (urlSting: string) => {
  if (/^https?:\/\/[^/]+\/index$/.test(urlSting)) {
    return urlSting.replace(/\/index$/, '/')
  }
  return urlSting.replace(/\/index$/, '')
}

export const replaceUrlProtocol = (
  urlString: string,
  protocol: 'ws' | 'http',
) => {
  switch (protocol) {
    case 'ws':
      return urlString.replace(/^http/, 'ws')
    case 'http':
      return urlString.replace(/^ws/, 'http')
  }
}

export const replaceUrlParam = (
  urlString: string,
  params: Record<string, string | undefined>,
) => {
  for (const [k, v] of Object.entries(params)) {
    const reg = new RegExp(`/:${k}(?:{[^/]+})?\\??`)
    urlString = urlString.replace(reg, v ? `/${v}` : '')
  }
  return urlString
}

export const buildSearchParams = (query: Record<string, string | string[]>) => {
  const searchParams = new URLSearchParams()

  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) {
      continue
    }

    if (Array.isArray(v)) {
      for (const v2 of v) {
        searchParams.append(k, v2)
      }
    } else {
      searchParams.set(k, v)
    }
  }

  return searchParams
}
