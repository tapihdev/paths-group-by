/**
 * Unit tests for the action's glob matching functionality, src/match.ts
 */

import { match, normalizePath } from '../src/match'

describe('normalizePath', () => {
  test('should normalize the path', () => {
    expect(normalizePath('/')).toBe('/')
    expect(normalizePath('//')).toBe('/')
    expect(normalizePath('///')).toBe('/')
    expect(normalizePath('path')).toBe('path')
    expect(normalizePath('path/')).toBe('path')
    expect(normalizePath('path//')).toBe('path')
    expect(normalizePath('path///')).toBe('path')
    expect(normalizePath('path//to//')).toBe('path/to')
    expect(normalizePath('path///to///')).toBe('path/to')
    expect(normalizePath('path//to//file')).toBe('path/to/file')
    expect(normalizePath('path///to///file')).toBe('path/to/file')
  })
})

describe('match', () => {
  test('should throw an error when using doublestar', () => {
    expect(() => {
      match('path/**', 'path/to/file')
    }).toThrow(Error)
  })

  test.each([
    ['path', '*', 'path'],
    ['path/', '*', 'path'],
    ['path/to/file', '*', 'path'],
    ['path/to/file', 'path/*', 'path/to'],
    ['path/to/file', 'path/to/*', 'path/to/file'],
    ['path/to/file', 'path/to/*/', 'path/to/file'],
    ['path/to/file', 'path//to/*', 'path/to/file'],
    ['path/to/file', 'path/to/*//', 'path/to/file'],
    ['path/to/file/', 'path/to/*', 'path/to/file'],
    ['path/to/file/', 'path/to/*/', 'path/to/file'],
    ['path//to/file', 'path/to/*', 'path/to/file'],
    ['path/to/file', 'path/*/file', 'path/to/file'],
    ['path/to/file', 'path/*/file/', 'path/to/file'],
    ['path/to/file/', 'path/*/file', 'path/to/file'],
    ['path/to/file/', 'path/*/file/', 'path/to/file'],
    ['.path/to/file', '*', '.path'],
    ['.path/to/file', '.path/*', '.path/to'],
    ['path/to/file', 'nomatch', null],
    ['path/to', 'path/to/*', null],
    ['path/to', 'path/*/file', null]
  ])(
    'should return matched substrings (path: %s, pattern: %s, expected %s)',
    (path, pattern, expected) => {
      expect(match(pattern, path)).toBe(expected)
    }
  )
})
