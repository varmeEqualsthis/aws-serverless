import * as reqContext from "./requestContext"

function getContext() {
  // note: this is a shallow copy
  return Object.assign({}, reqContext.get())
}

function isDebugEnabled() {
  // disable debug logging by default, but allow override via env variables
  // or if enabled via forwarded request context
  return process.env.DEBUG_LOG === "true" ||
         reqContext.get()["Debug-Log-Enabled"] === "true"
}

function log(level, msg, params?) {
  if (level === "DEBUG" && !isDebugEnabled()) {
    return
  }

  const logMsg = getContext()
  logMsg.level   = level
  logMsg.message = msg
  logMsg.params  = params

  console.log(JSON.stringify(logMsg))
}

export const debug = (msg, params?) => log("DEBUG", msg, params)
export const info  = (msg, params?) => log("INFO", msg, params)
export const warn  = (msg, params?) => log("WARN", msg, params)
export const error = (msg, params?) => log("ERROR", msg, params)
