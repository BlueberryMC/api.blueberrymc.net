import { w } from '../../util'

export default w(async (req: Request, res: Response) => {
  const versionGroup = await res.locals.getVersionGroup()
  if (!versionGroup) {
    return res.status(404).json({ error: 'version group not found' })
  }
  const builds = await Promise.all((await versionGroup.getBuilds()).map(build => build.fetch()))
  res.send({ builds })
})
