import { Request as ERequest, Response as EResponse, NextFunction as ENextFunction } from 'express'
import { FieldInfo } from 'mysql'
import { Project } from '../src/model/project'
import { VersionGroup } from '../src/model/versionGroup'
import { Build } from '../src/model/build'
import { Version } from '../src/model/version'

declare global {
  type Request = ERequest

  type Response = EResponse & {
    locals: {
      getProject(): Promise<Project | null>
      getVersionGroup(): Promise<VersionGroup | null>
      getVersion(): Promise<Version | null>
      getBuild(): Promise<Build | null>
      getBuild(full: boolean): Promise<Build | null>
    }
  }

  type NextFunction = ENextFunction

  type QueryResult = {
    results: Array<unknown>
    fields?: FieldInfo[]
  }

  type RawProject = {
    id: number
    name: string
    description: string
    created_at: string
    repo_url: string
  }

  type RawVersionGroup = {
    id: number
    project_id: number
    name: string
    description: string
    created_at: string
    experimental: number
    legacy: number
    branch: string
  }

  type RawVersion = {
    id: number
    version_group_id: number
    name: string
  }

  type RawBuild = {
    id: number
    version_id: number
    build_number: number
    experimental: number
    promoted: number
  }

  type RawBuildFile = {
    id: number
    build_id: number
    type: string
    download_url: string
  }

  type RawBuildChanges = {
    id: number
    build_id: number
    sha: string
    description: string
  }
}
