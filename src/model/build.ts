import { findAll, findOne } from '../sql'
import { BuildChanges } from './buildChanges'
import { BuildFiles } from './buildFiles'

export class Build {
  public readonly id: number
  public readonly version_id: number
  public readonly build_number: number
  public readonly experimental: boolean
  public readonly promoted: boolean

  public readonly version: string | null = null
  public readonly changes: Array<BuildChanges> | null
  public readonly files: Array<BuildFiles> | null

  public readonly full: boolean

  constructor(
    id: number,
    version_id: number,
    build_number: number,
    experimental: boolean,
    promoted: boolean,
    version: string | null = null,
    changes: Array<BuildChanges> | null = null,
    files: Array<BuildFiles> | null = null
  ) {
    this.id = id
    this.version_id = version_id
    this.build_number = build_number
    this.experimental = experimental
    this.promoted = promoted

    this.version = version
    this.changes = changes
    this.files = files

    this.full = changes != null && files != null
  }

  fetchVersionName(): Promise<string | null> {
    return findOne('SELECT `name` FROM `versions` WHERE `id` = ? LIMIT 1', this.version_id)
      .then(res => res !== null ? (res as RawVersion).name : null)
  }

  fetchChanges(): Promise<Array<BuildChanges>> {
    return BuildChanges.getByCustomQuery('SELECT * FROM `build_changes` WHERE `build_id` = ?', this.id)
  }

  fetchFiles(): Promise<Array<BuildFiles>> {
    return BuildFiles.getByCustomQuery('SELECT * FROM `build_files` WHERE `build_id` = ?', this.id)
  }

  async fetch(): Promise<Build> {
    if (this.full) {
      return this
    }
    const version = await this.fetchVersionName()
    const changes = await this.fetchChanges()
    const files = await this.fetchFiles()
    return new Build(this.id, this.version_id, this.build_number, this.experimental, this.promoted, version, changes, files)
  }

  private static convertFromRaw(rawBuild: RawBuild): Build | null {
    if (!rawBuild) {
      return null
    }
    return new Build(rawBuild.id, rawBuild.version_id, rawBuild.build_number, rawBuild.experimental === 1, rawBuild.promoted === 1)
  }

  static findById(id: number): Promise<Build | null> {
    return findOne('SELECT * FROM `builds` WHERE `id` = ? LIMIT 1', id).then(res => Build.convertFromRaw(res as RawBuild))
  }

  static findByBuildNumber(versionId: number, buildNumber: number): Promise<Build | null> {
    return findOne('SELECT * FROM `builds` WHERE `version_id` = ? AND `build_number` = ? LIMIT 1', versionId, buildNumber)
      .then(res => Build.convertFromRaw(res as RawBuild))
  }

  static getByCustomQuery(query: string, ...params: any[]): Promise<Array<Build>> {
    return findAll(query, ...params).then(res => res.map(value => Build.convertFromRaw(value as RawBuild)!))
  }
}
