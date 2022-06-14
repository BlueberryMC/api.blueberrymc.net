import { findAll, findOne } from '../sql'
import { VersionGroup } from './versionGroup'
import { Version } from './version'

export class Project {
  public readonly id: number
  public readonly name: string
  public readonly description: string
  public readonly created_at: number
  public readonly repo_url: string

  constructor(id: number, name: string, description: string, created_at: number, repo_url: string) {
    this.id = id
    this.name = name
    this.description = description
    this.created_at = created_at
    this.repo_url = repo_url
  }

  getVersions(): Promise<Array<Version>> {
    return Version.getByCustomQuery('SELECT * FROM `versions` WHERE `version_group_id` IN (SELECT `id` FROM `version_groups` WHERE `project_id` = ?)', this.id)
  }

  async findVersionByName(name: string): Promise<Version | null> {
    const array = await Version.getByCustomQuery('SELECT * FROM `versions` WHERE `version_group_id` IN (SELECT `id` FROM `version_groups` WHERE `project_id` = ?) AND `name` = ?', this.id, name)
    return array.length > 0 ? array[0] : null
  }

  findVersionGroupByName(name: string): Promise<VersionGroup | null> {
    return VersionGroup.findByName(this.id, name)
  }

  getVersionGroups(): Promise<Array<VersionGroup>> {
    return VersionGroup.getAllByProjectId(this.id)
  }

  private static convertFromRaw(rawProject: RawProject): Project | null {
    if (!rawProject) {
      return null
    }
    return new Project(rawProject.id, rawProject.name, rawProject.description, new Date(rawProject.created_at).getTime(), rawProject.repo_url)
  }

  static findById(id: number): Promise<Project | null> {
    return findOne('SELECT * FROM `projects` WHERE `id` = ? LIMIT 1', id).then(res => Project.convertFromRaw(res as RawProject))
  }

  static findByName(name: string): Promise<Project | null> {
    return findOne('SELECT * FROM `projects` WHERE `name` = ? LIMIT 1', name).then(res => Project.convertFromRaw(res as RawProject))
  }

  static getAllProjects(): Promise<Array<Project>> {
    return findAll('SELECT * FROM `projects`').then(res => res.map(res => Project.convertFromRaw(res as RawProject)!))
  }
}
