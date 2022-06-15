import { w } from '../../util'

export default w(async (req: Request, res: Response) => {
  const project = await res.locals.getProject()
  if (!project) {
    return res.status(404).send({ error: 'missing project: ' + req.params.project })
  }
  res.send({ versions: await project.getVersions() })
})
