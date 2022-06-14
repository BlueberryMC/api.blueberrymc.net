import { findAll } from '../sql'

export class BuildChanges {
  public readonly id: number
  public readonly build_id: number
  public readonly sha: string
  public readonly description: string

  constructor(id: number, build_id: number, sha: string, description: string) {
    this.id = id
    this.build_id = build_id
    this.sha = sha
    this.description = description
  }

  private static convertFromRaw(rawBuildChanges: RawBuildChanges): BuildChanges | null {
    if (!rawBuildChanges) {
      return null
    }
    return new BuildChanges(rawBuildChanges.id, rawBuildChanges.build_id, rawBuildChanges.sha, rawBuildChanges.description)
  }

  static getByCustomQuery(query: string, ...params: any[]): Promise<Array<BuildChanges>> {
    return findAll(query, ...params).then(res => res.map(value => BuildChanges.convertFromRaw(value as RawBuildChanges)!))
  }
}
