export default async (req: Request, res: Response) => {
  const build = await res.locals.getBuild()
  if (!build) {
    return res.status(404).json({ error: 'build not found' })
  }
  const files = await build.fetchFiles()
  if (files.length === 0) {
    return res.status(404).json({ error: 'no downloadable file for this build' })
  }
  for (const file of files) {
    if (file.type === req.params.downloadType) {
      return res.redirect(file.download_url)
    }
  }
  return res.status(404).json({ error: 'no downloadable file for type ' + req.params.downloadType })
}
