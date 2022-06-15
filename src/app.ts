require('dotenv-safe').config()

import { checkDatabaseVersion } from './sql'
// noinspection JSIgnoredPromiseFromCall
checkDatabaseVersion()

import path from 'path'
import express from 'express'
import logger from 'morgan'

const debug = require('debug')('api.blueberrymc.net:app')
const { router } = require('./routes')

export const app = express()

process.on('unhandledRejection', (reason) => {
  debug('Caught exception in promise: ', reason)
})

app.use(logger('dev', {
  stream: {
    write: (s: string) => {
      debug(s.substring(0, s.length - 1)) // morgan tries to print \n, so we remove that here
    }
  }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  res.locals.getProject = async () => null
  res.locals.getVersionGroup = async () => null
  res.locals.getBuild = async () => null
  next()
})

app.use('/', router)

// catch 404
// noinspection JSUnusedLocalSymbols
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send({ error: 'not found' })
})

// error handler
// noinspection JSUnusedLocalSymbols
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err.stack || err)
  res.status(err.status || 500).send({ error: 'internal server error' })
})
