import express from 'express'
import { router as projectRouter } from '../project'
import listHandler from './list'

export const router = express.Router()

router.get('/', listHandler)

router.use('/:project', projectRouter)
