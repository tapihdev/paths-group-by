/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Other utilities
// Mock the GitHub Actions core library
let infoMock: jest.SpiedFunction<typeof core.info>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('sets the directories output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'paths':
          return '[ "path/to/file", "path/to/another/file" ]'
        case 'glob':
          return 'path/*'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(infoMock).toHaveBeenNthCalledWith(
      1,
      'paths: path/to/file,path/to/another/file'
    )
    expect(infoMock).toHaveBeenNthCalledWith(2, 'glob: path/*')
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'directories',
      expect.stringMatching(/^\[.*\]$/)
    )
  })

  it('sets a failed status when the paths input is string', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'paths':
          return 'this is not a JSON array'
        case 'glob':
          return 'path/*'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/^failed to parse the paths input: /)
    )
    expect(infoMock).not.toHaveBeenCalled()
  })

  it('sets a failed status when the paths input is not a JSON array', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'paths':
          return '{ "this": "is not", "a": "JSON array" }'
        case 'glob':
          return 'path/*'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/^failed to parse the paths input: /)
    )
    expect(infoMock).not.toHaveBeenCalled()
  })
})
