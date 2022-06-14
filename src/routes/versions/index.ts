import express from 'express'
import { router as versionRouter } from '../version'
import listHandler from './list'

export const router = express.Router()

router.get('/', listHandler)

router.use('/:version', versionRouter)
