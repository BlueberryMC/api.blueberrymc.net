import express from 'express'
import { Version } from '../../model/version'
import listBuildsHandler from './listBuilds'

export const router = express.Router({ mergeParams: true })

router.use(async (req, res: Response, next) => {
  const versionIdOrName = String(req.params.version)
  res.locals.getVersion = async () => {
    const versionId = parseInt(versionIdOrName, 10)
    if (!isNaN(versionId) && versionId > 0) {
      const versionGroup = Version.findById(versionId)
      if (versionGroup) {
        return versionGroup
      }
    }
    const project = await res.locals.getProject()
    if (!project) {
      return null
    }
    return project.findVersionByName(versionIdOrName)
  }
  next()
})

router.get('/', listBuildsHandler)
