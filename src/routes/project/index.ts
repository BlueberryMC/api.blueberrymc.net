import express from 'express'
import { router as versionGroupsRouter } from '../version_groups'
import { router as versionsRouter } from '../versions'
import { Project } from '../../model/project'

export const router = express.Router({ mergeParams: true })

router.use(async (req, res, next) => {
  const projectIdOrName = String(req.params.project)
  res.locals.getProject = async () => {
    const projectId = parseInt(projectIdOrName, 10)
    if (!isNaN(projectId) && projectId > 0) {
      const project = await Project.findById(projectId)
      if (project) {
        return project
      }
    }
    return Project.findByName(projectIdOrName)
  }
  next()
})

router.use('/version_groups', versionGroupsRouter)
router.use('/versions', versionsRouter)
