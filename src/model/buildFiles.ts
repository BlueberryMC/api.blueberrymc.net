import { findAll } from '../sql'

export class BuildFiles {
  public readonly id: number
  public readonly build_id: number
  public readonly type: string
  public readonly download_url: string

  constructor(id: number, build_id: number, type: string, download_url: string) {
    this.id = id
    this.build_id = build_id
    this.type = type
    this.download_url = download_url
  }

  private static convertFromRaw(rawBuildFile: RawBuildFile): BuildFiles | null {
    if (!rawBuildFile) {
      return null
    }
    return new BuildFiles(rawBuildFile.id, rawBuildFile.build_id, rawBuildFile.type, rawBuildFile.download_url)
  }

  static getByCustomQuery(query: string, ...params: any[]): Promise<Array<BuildFiles>> {
    return findAll(query, ...params).then(res => res.map(value => BuildFiles.convertFromRaw(value as RawBuildFile)!))
  }
}
