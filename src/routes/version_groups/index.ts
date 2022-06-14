import express from 'express'
import { router as versionGroupRouter } from '../version_group'
import listHandler from './list'

export const router = express.Router()

router.get('/', listHandler)

router.use('/:versionGroup', versionGroupRouter)
