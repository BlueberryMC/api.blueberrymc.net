import { findAll, findOne } from '../sql'
import { Project } from './project'
import { Version } from './version'
import { Build } from './build'

export class VersionGroup {
  public readonly id: number
  public readonly project_id: number
  public readonly name: string
  public readonly description: string
  public readonly created_at: number
  public readonly experimental: boolean
  public readonly legacy: boolean
  public readonly branch: string

  constructor(
    id: number,
    project_id: number,
    name: string,
    description: string,
    created_at: number,
    experimental: boolean,
    legacy: boolean,
    branch: string,
  ) {
    this.id = id
    this.project_id = project_id
    this.name = name
    this.description = description
    this.created_at = created_at
    this.experimental = experimental
    this.legacy = legacy
    this.branch = branch
  }

  getProject(): Promise<Project> {
    return Project.findById(this.project_id).then(res => {
      if (!res) {
        throw new Error(`Project with id ${this.project_id} not found`)
      }
      return res
    })
  }

  getVersions(): Promise<Array<Version>> {
    return Version.getByCustomQuery('SELECT * FROM `versions` WHERE `version_group_id` = ?', this.id)
  }

  findVersionByName(name: string): Promise<Version | null> {
    return Version.findByName(this.id, name)
  }

  async findBuildByBuildNumber(buildNumber: number): Promise<Build | null> {
    const array = await Build.getByCustomQuery('SELECT * FROM `builds` WHERE `version_id` IN (SELECT `id` FROM `versions` WHERE `version_group_id` = ?) AND `build_number` = ? LIMIT 1', this.id, buildNumber)
    return array.length > 0 ? array[0] : null
  }

  getBuilds(limit?: number): Promise<Array<Build>> {
    if (typeof limit === 'undefined') {
      return Build.getByCustomQuery('SELECT * FROM `builds` WHERE `version_id` IN (SELECT `id` FROM `versions` WHERE `version_group_id` = ?)', this.id)
    } else {
      return Build.getByCustomQuery('SELECT * FROM `builds` WHERE `version_id` IN (SELECT `id` FROM `versions` WHERE `version_group_id` = ?) LIMIT ?', this.id, limit)
    }
  }

  private static convertFromRaw(rawVersionGroup: RawVersionGroup): VersionGroup | null {
    if (!rawVersionGroup) {
      return null
    }
    return new VersionGroup(
      rawVersionGroup.id,
      rawVersionGroup.project_id,
      rawVersionGroup.name,
      rawVersionGroup.description,
      new Date(rawVersionGroup.created_at).getTime(),
      rawVersionGroup.experimental === 1,
      rawVersionGroup.legacy === 1,
      rawVersionGroup.branch,
    )
  }

  static findById(id: number): Promise<VersionGroup | null> {
    return findOne('SELECT * FROM `version_groups` WHERE `id` = ? LIMIT 1', id)
      .then(res => VersionGroup.convertFromRaw(res as RawVersionGroup))
  }

  static findByName(projectId: number, name: string): Promise<VersionGroup | null> {
    return findOne('SELECT * FROM `version_groups` WHERE `project_id` = ? AND `name` = ? LIMIT 1', projectId, name)
      .then(res => VersionGroup.convertFromRaw(res as RawVersionGroup))
  }

  static getAllByProjectId(projectId: number): Promise<Array<VersionGroup>> {
    return findAll('SELECT * FROM `version_groups` WHERE `project_id` = ?', projectId)
      .then(res => res.map(res => VersionGroup.convertFromRaw(res as RawVersionGroup)!))
  }
}
