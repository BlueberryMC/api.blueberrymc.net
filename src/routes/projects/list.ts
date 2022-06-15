import { w } from '../../util'
import { Project } from '../../model/project'

export default w(async (req: Request, res: Response) => res.send({ projects: await Project.getAllProjects() }))
