import express from 'express'
import createHandler from './create'
import { router as buildRouter } from '../build'
import listHandler from './list'

export const router = express.Router()

router.get('/', listHandler)

router.put('/', createHandler)

router.use('/:build', buildRouter)
