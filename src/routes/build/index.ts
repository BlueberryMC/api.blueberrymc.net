import express from 'express'
import createHandler from './create'
import downloadListHandler from './downloadList'
import downloadFileHandler from './downloadFile'

export const router = express.Router({ mergeParams: true })

router.use((req, res: Response, next) => {
  const buildNumber = parseInt(String(req.params.build), 10)
  if (isNaN(buildNumber) || buildNumber < 0 || String(req.params.build).includes('.')) {
    return res.status(400).json({ error: 'invalid build number' })
  }
  res.locals.getBuild = async (full: boolean = false) => {
    const versionGroup = await res.locals.getVersionGroup()
    if (!versionGroup) {
      return null
    }
    const build = versionGroup.findBuildByBuildNumber(buildNumber)
    if (full) {
      return build.then(build => build != null ? build.fetch() : build)
    } else {
      return build
    }
  }
  next()
})

router.put('/', createHandler)

router.get('/download', downloadListHandler)

router.get('/download/:downloadType', downloadFileHandler)

router.get(/\/download\/:downloadType\/.*/, downloadFileHandler)
