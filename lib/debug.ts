// Enhanced debug utility that logs detailed information to console in development
export const debug = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      const stack = new Error().stack?.split("\n")[2]?.trim()
      const caller = stack ? `[${stack.split("at ")[1]?.split(" ")[0]}]` : ""
      console.log(`[DEBUG]${caller}`, ...args)
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      const stack = new Error().stack?.split("\n")[2]?.trim()
      const caller = stack ? `[${stack.split("at ")[1]?.split(" ")[0]}]` : ""
      console.error(`[DEBUG ERROR]${caller}`, ...args)
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      const stack = new Error().stack?.split("\n")[2]?.trim()
      const caller = stack ? `[${stack.split("at ")[1]?.split(" ")[0]}]` : ""
      console.warn(`[DEBUG WARN]${caller}`, ...args)
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      const stack = new Error().stack?.split("\n")[2]?.trim()
      const caller = stack ? `[${stack.split("at ")[1]?.split(" ")[0]}]` : ""
      console.info(`[DEBUG INFO]${caller}`, ...args)
    }
  },
  group: (label: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.group(`[DEBUG GROUP] ${label}`)
    }
  },
  groupEnd: () => {
    if (process.env.NODE_ENV !== "production") {
      console.groupEnd()
    }
  },
  table: (data: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.table(data)
    }
  },
  time: (label: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.time(`[DEBUG TIME] ${label}`)
    }
  },
  timeEnd: (label: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.timeEnd(`[DEBUG TIME] ${label}`)
    }
  },
}
