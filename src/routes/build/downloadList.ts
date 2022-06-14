export default async (req: Request, res: Response) => {
  const build = await res.locals.getBuild()
  if (!build) {
    return res.status(404).json({ error: 'build not found' })
  }
  res.send({ files: await build.fetchFiles() })
}
