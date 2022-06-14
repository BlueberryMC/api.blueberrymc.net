import express from 'express'
import { router as buildRouter } from '../build'
import listHandler from './list'

export const router = express.Router()

router.get('/', listHandler)

router.use('/:build', buildRouter)
