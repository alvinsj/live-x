import '@testing-library/jest-dom/extend-expect'

import { loadEnvConfig } from '@next/env'
const loadEnv = async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}

export default loadEnv