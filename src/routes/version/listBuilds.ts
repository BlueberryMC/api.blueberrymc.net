export default async (req: Request, res: Response) => {
  const version = await res.locals.getVersion()
  if (!version) {
    return res.status(404).json({ error: 'version not found' })
  }
  const builds = await Promise.all((await version.getBuilds()).map(build => build.fetch()))
  res.send({ builds })
}
