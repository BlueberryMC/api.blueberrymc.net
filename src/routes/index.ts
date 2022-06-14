import express from 'express'
import { router as projectsRouter } from './projects'

export const router = express.Router()

router.use('/projects', projectsRouter)
