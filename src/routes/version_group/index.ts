import express from 'express'
import { VersionGroup } from '../../model/versionGroup'
import { router as buildsRouter } from '../builds'

export const router = express.Router({ mergeParams: true })

router.use(async (req, res: Response, next) => {
  const versionGroupIdOrName = String(req.params.versionGroup)
  res.locals.getVersionGroup = async () => {
    const projectId = parseInt(versionGroupIdOrName, 10)
    if (!isNaN(projectId) && projectId > 0) {
      const versionGroup = VersionGroup.findById(projectId)
      if (versionGroup) {
        return versionGroup
      }
    }
    const project = await res.locals.getProject()
    if (!project) {
      return null
    }
    return project.findVersionGroupByName(versionGroupIdOrName)
  }
  next()
})

router.use('/builds', buildsRouter)
