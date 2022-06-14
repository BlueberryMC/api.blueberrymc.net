import { Connection, createPool } from 'mysql'
import migrations from './migrations'

const debug = require('debug')('api.blueberrymc.net:sql')
const pool = createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
})

// Base methods

export const getConnection = /*async*/ (): Promise<Connection> => {
  return new Promise((resolve, reject) =>
    pool.getConnection((err, connection) => {
        if (err) {
          debug(err)
          return reject(err)
        }
        resolve(connection)
      }
    )
  )
}

export const query = (sql: string, ...values: any): Promise<QueryResult> => {
  return new Promise((resolve, reject) => {
    debug(sql, values)
    pool.query(sql, values, (error: any, results: any, fields: any) => {
      if (error) {
        return reject(error)
      }
      resolve({ results, fields })
    })
  })
}

export const queryWithConnection = (connection: Connection, sql: string, ...values: any): Promise<QueryResult> => {
  return new Promise((resolve, reject) => {
    debug(sql, values)
    connection.query(sql, values, (error: any, results: any, fields: any) => {
      if (error) {
        debug(error)
        return reject(error)
      }
      resolve({ results, fields })
    })
  })
}

export const shutdown = (): Promise<void> =>
  new Promise((resolve, reject) =>
    pool.end((err) => {
      if (err) {
        debug('Failed to shutdown mysql', err)
        return reject(err)
      }
      resolve()
    })
  )

// Helper methods

export const findOne = async (sql: string, ...values: any): Promise<unknown> => {
  if (!sql.toLowerCase().startsWith('insert')) {
    return await query(sql, ...values).then(value => value.results[0] || null)
  }
  // we need to get new connection because LAST_INSERT_ID is per-connection basis.
  const connection = await getConnection()
  await queryWithConnection(connection, sql, ...values)
  return await queryWithConnection(connection, "SELECT LAST_INSERT_ID() AS why")
    .then(value => value.results[0] ? (value.results[0] as { why: number })['why'] : null)
}

export const findAll = async (sql: string, ...values: any): Promise<Array<unknown>> => {
  if (!sql.toLowerCase().startsWith('insert')) {
    return await query(sql, ...values).then(value => value.results)
  }
  // returns LAST_INSERT_ID()
  return [ await findOne(sql, values) ]
}

export const getSettingsValue = async (key: string): Promise<string | null> => {
  if (await query('SHOW TABLES').then(res => res.results.length === 0)) {
    return null
  }
  return await findOne('SELECT `value` FROM `settings` WHERE `key` = ?', key)
    .then(res => res ? (res as { value: string }).value as string : null)
}

export const getDatabaseVersion = async (): Promise<number> =>
  getSettingsValue('database_version').then((value) => value != null ? parseInt(value) : 0)

export const setDatabaseVersion = async (version: number): Promise<void> =>
  query('UPDATE `settings` SET `value` = ? WHERE `key` = "database_version"', version).then(() => {})

export const runMigrations = async () => {
  let version = await getDatabaseVersion()
  if (migrations[migrations.length - 1].to === version) {
    debug('\u2705 Nothing to migrate. Database is up to date.')
    return
  }
  for (let migration of migrations) {
    if (migration.from === version) {
      await migration.handler()
      version = await getDatabaseVersion()
      if (migration.to === version) {
        debug(`\u2705 Migration ${migration.name} (${migration.from} -> ${migration.to}) completed`)
      } else {
        throw new Error(`\u274c Migration ${migration.name} (${migration.from} -> ${migration.to}) did not update database version`)
      }
    }
  }
}

export const checkDatabaseVersion = () =>
  getDatabaseVersion().then(async version => {
    if (migrations[migrations.length - 1].to !== version) {
      const err = new Error('\u274c Database is not up-to-date. Please run migrations using `npm run migrate` or `yarn run migrate`.')
      console.log(err.stack || err)
      await shutdown()
      process.exit(1)
    } else {
      debug('\u2705 Database is up to date.')
    }
  })
