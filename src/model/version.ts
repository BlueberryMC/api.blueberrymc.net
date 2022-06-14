import { findAll, findOne } from '../sql'
import { Build } from './build'

export class Version {
  public readonly id: number
  public readonly version_group_id: number
  public readonly name: string

  constructor(id: number, version_group_id: number, name: string) {
    this.id = id
    this.version_group_id = version_group_id
    this.name = name
  }

  findBuildByBuildNumber(buildNumber: number): Promise<Build | null> {
    return Build.findByBuildNumber(this.id, buildNumber)
  }

  getBuildNumbers(): Promise<number[]> {
    return findAll('SELECT `build_number` FROM `builds` WHERE `version_id` = ? ORDER BY `build_number`', this.id).then(res => res as number[])
  }

  getBuilds(): Promise<Array<Build>> {
    return Build.getByCustomQuery('SELECT * FROM `builds` WHERE `version_id` = ? ORDER BY `build_number`', this.id)
  }

  private static convertFromRaw(rawVersion: RawVersion): Version | null {
    if (!rawVersion) {
      return null
    }
    return new Version(rawVersion.id, rawVersion.version_group_id, rawVersion.name)
  }

  static findById(id: number): Promise<Version | null> {
    return findOne('SELECT * FROM `versions` WHERE `id` = ? LIMIT 1', id).then(res => Version.convertFromRaw(res as RawVersion))
  }

  static findByName(versionGroupId: number, name: string): Promise<Version | null> {
    return findOne('SELECT * FROM `versions` WHERE `version_group_id` = ? AND `name` = ? LIMIT 1', versionGroupId, name)
      .then(res => Version.convertFromRaw(res as RawVersion))
  }

  static getByCustomQuery(query: string, ...params: any[]): Promise<Array<Version>> {
    return findAll(query, ...params).then(res => res.map(value => Version.convertFromRaw(value as RawVersion)!))
  }
}
