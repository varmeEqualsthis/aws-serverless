declare var global: NodeJS.Global | any

export const clearAll = () => global.CONTEXT = undefined

export const replaceAllWith = (ctx) => global.CONTEXT = ctx

export const set = (key, value) => {
  if (!key.startsWith("x-correlation-")) {
    key = "x-correlation-" + key
  }

  if (!global.CONTEXT) {
    global.CONTEXT = {}
  }

  global.CONTEXT[key] = value
}

export const get = () => global.CONTEXT || {}
