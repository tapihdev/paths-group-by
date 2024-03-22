import * as picomatch from 'picomatch'

export function normalizePath(str: string): string {
  // Deduplicate multiple slashes.
  const duduped = str.replace(/(\/){2,}/g, '/')

  if (duduped === '/') {
    return duduped
  }

  // Remove trailing slash.
  return duduped.replace(/\/$/g, '')
}

export function match(glob: string, path: string): string | null {
  // Validate the glob pattern.
  if (glob.includes('**')) {
    throw new Error(
      '`**` is not supported in the glob pattern to avoid too many matches. Use `*` instead.'
    )
  }

  const normalizedGlob = normalizePath(glob)
  const regexStr = picomatch
    .makeRe(
      normalizedGlob,
      // See https://github.com/micromatch/picomatch/tree/master?tab=readme-ov-file#picomatch-options for detail.
      {
        dot: true, // Allow matching hidden files.
        noglobstar: true // Disable `**` to avoid too many matches.
      }
    )
    .toString()

  // The regex string should have leading '/^' and trailing '$/'.
  // This should never happen, but validating the regex for safety.
  // https://github.com/micromatch/picomatch/blob/13efdf0c7d0e07ee30bf78d0079184aa4a0ec7d4/lib/picomatch.js#L327
  if (!regexStr.startsWith('/^') || !regexStr.endsWith('$/')) {
    throw new Error(`unexpected regex "${regexStr}"`)
  }

  // Remove leading '/' and trailing '$/' and add non capturing group to create new regex that matches
  // with subdirectories.
  const regex = RegExp(`(${regexStr.slice(1, -2)})(?:/|$)`)

  // Return the matched string with the first capture group or null.
  const matched = normalizePath(path).match(regex)
  if (matched === null) {
    return null
  }
  return normalizePath(matched[0])
}
