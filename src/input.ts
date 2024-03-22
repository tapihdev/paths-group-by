import * as core from '@actions/core'

export function getPaths(): string[] {
  try {
    const input = core.getInput('paths')
    const parsed = JSON.parse(input)

    if (!Array.isArray(parsed)) {
      throw new SyntaxError(`"${input}" is not a JSON array`)
    }
    return parsed
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`failed to parse the paths input: ${e.message}`)
    }
    throw e
  }
}

export function getGlob(): string {
  return core.getInput('glob')
}
