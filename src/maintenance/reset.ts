require('dotenv-safe').config()
import { findAll, query, shutdown } from '../sql'

if (!process.env.ALLOW_RESET) {
  console.log('You must set ALLOW_RESET to true-ish value to run this script.')
} else {
  (async () => {
    const tables = await findAll('SHOW TABLES') as Array<{ [table: string]: string }>
    for (const value of tables) {
      for (const key of Object.keys(value)) {
        const table = value[key]
        await query(`DROP TABLE ${table}`)
      }
    }
    await shutdown()
  })()
}
