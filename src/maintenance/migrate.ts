require('dotenv-safe').config()

import { runMigrations, shutdown } from '../sql'

(async () => {
  await runMigrations()
  await shutdown()
})()
