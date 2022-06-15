const debug = require('debug')('api.blueberrymc.net:util')

export const toStringOrNull = (value: any): string | null => {
  return value === null || value === undefined ? null : String(value)
}

// catch errors and return 500 error
export const w = <T> (handler: (req: Request, res: Response) => Promise<T>): (req: Request, res: Response) => Promise<T | null> => {
  return async (req, res) => {
    try {
      return await handler(req, res)
    } catch (e) {
      debug(e.stack || e)
      res.status(500).send({ error: 'internal server error' })
      return null
    }
  }
}
