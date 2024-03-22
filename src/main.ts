import * as core from '@actions/core'
import path from 'path'

import { match } from './match'
import { getGlob, getPaths } from './input'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const paths = getPaths()
    const glob = getGlob()

    core.info(`paths: ${paths}`)
    core.info(`glob: ${glob}`)

    const grouped = [
      ...new Set(
        paths
          .map(p => path.dirname(p))
          .map(d => match(glob, d))
          .filter(d => d !== null)
      )
    ]

    core.setOutput('directories', JSON.stringify(grouped))
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
