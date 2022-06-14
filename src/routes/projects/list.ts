import { Project } from '../../model/project'

export default async (req: Request, res: Response) => res.send({ projects: await Project.getAllProjects() })
