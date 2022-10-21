import { Octokit } from 'octokit'
import { toStringOrNull, w } from '../../util'
import { findAll, findOne, query } from '../../sql'

const debug = require('debug')('api.blueberrymc.net:routes:build:create')

const VERSION_GROUP_REGEX = /^\d+[._]\d+$/

const octokit =
  new Octokit({
    userAgent: 'api.blueberrymc.net/main',
    auth: process.env.GITHUB_TOKEN,
  })

export default w(async (req: Request, res: Response) => {
  if (req.headers.authorization !== `Bearer ${process.env.SECRET_KEY}`) {
    return res.status(401).send({ error: 'unauthorized' })
  }
  const pRepo = toStringOrNull(req.query['repo'])
  const pCommit = toStringOrNull(req.query['commit'])
  const pVersionGroup = toStringOrNull(req.query['versionGroup'])
  const pVersion = toStringOrNull(req.query['version'])
  const pBranch = toStringOrNull(req.query['branch'])
  if (!pRepo ||
    !pRepo.includes('/') ||
    !pCommit ||
    !pVersionGroup ||
    !pVersion ||
    !pBranch ||
    !VERSION_GROUP_REGEX.test(pVersionGroup) ||
    pVersion.includes('/')) {
    return res.status(400).send({ error: 'missing or invalid parameters' })
  }
  const owner = pRepo.split('/')[0]
  const repo = pRepo.split('/')[1]
  const dottedVersionGroup = pVersionGroup.replace('_', '.')
  const experimental = pBranch !== 'main' && pBranch !== 'master' && !pBranch.startsWith('ver/')
  const project = await res.locals.getProject()
  if (!project) {
    return res.status(404).send({ error: 'project not found' })
  }
  let versionGroup = await project.findVersionGroupByName(dottedVersionGroup)
  if (!versionGroup) {
    await query('INSERT INTO `version_groups` (`project_id`, `name`, `description`, `experimental`, `branch`) VALUES (?, ?, ?, ?, ?)', project.id, dottedVersionGroup, '', experimental, pBranch)
    versionGroup = await project.findVersionGroupByName(dottedVersionGroup)
    if (!versionGroup) {
      return res.status(500).send({ error: 'internal server error', message: 'failed to create version group' })
    }
  }
  let version = await versionGroup.findVersionByName(pVersion)
  if (!version) {
    await query('INSERT INTO `versions` (`version_group_id`, `name`) VALUES (?, ?)', versionGroup.id, pVersion)
    version = await versionGroup.findVersionByName(pVersion)
    if (!version) {
      return res.status(500).send({ error: 'internal server error', message: 'failed to create version' })
    }
  }
  const buildNumber = parseInt(String(req.params.build), 10)
  const dupeBuild = await version.findBuildByBuildNumber(buildNumber)
  if (dupeBuild) {
    return res.status(409).send({ error: 'build already exists' })
  }
  const veryLongQueryWithSubQueries = 'SELECT `sha` FROM `build_changes` WHERE `build_id` = (SELECT `id` FROM `builds` WHERE `version_id` = ? ORDER BY `build_number` DESC LIMIT 1)'
  const lastCommits = await findAll(veryLongQueryWithSubQueries, version.id).then(res => res.map(value => value as { sha: string }).map(o => o.sha))
  const buildId = await findOne('INSERT INTO `builds` (`version_id`, `build_number`, `experimental`) VALUES (?, ?, ?)', version.id, buildNumber, experimental) as number
  const handmadeDownloadUrl = `https://github.com/${owner}/${repo}/releases/download/${pVersion}.${buildNumber}/blueberry-${pVersion}.${buildNumber}-installer.jar`
  await query('INSERT INTO `build_files` (`build_id`, `type`, `download_url`) VALUES (?, ?, ?)', buildId, 'universal-installer', handmadeDownloadUrl)
  const getCommitResult = await octokit.rest.repos.getCommit({
    ref: pCommit,
    owner: owner,
    repo: repo,
  })
  if (getCommitResult.status !== 200) {
    return res.status(500).send({ error: 'internal server error', message: 'failed to calculate changes' })
  }
  try {
    if (lastCommits.length > 0) {
      const compareResult = await octokit.rest.repos.compareCommits({
        base: lastCommits[0],
        head: pCommit,
        owner: owner,
        repo: repo,
      })
      if (compareResult.status !== 200) {
        return res.status(500).send({ error: 'internal server error', message: 'failed to calculate changes' })
      }
      for (const commit of compareResult.data.commits) {
        if (lastCommits.includes(commit.sha) || pCommit === commit.sha) {
          continue
        }
        await query('INSERT INTO `build_changes` (`build_id`, `sha`, `description`) VALUES (?, ?, ?)', buildId, commit.sha, commit.commit.message)
      }
    }
  } catch (e) {
    debug(`failed to calculate changes (pCommit: ${pCommit}, lastCommits: ${lastCommits} ([0] = ${lastCommits[0]}), owner: ${owner}, repo: ${repo}, version.id: ${version.id})`)
    throw e
  } finally {
    // try to insert at the end
    await query('INSERT INTO `build_changes` (`build_id`, `sha`, `description`) VALUES (?, ?, ?)', buildId, getCommitResult.data.sha, getCommitResult.data.commit.message)
  }
  res.status(200).send({ message: 'accepted' })
})
