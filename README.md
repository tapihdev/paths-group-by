# paths-group-by

This action runs in conjunction with
[dorny/paths-filter](https://github.com/dorny/paths-filter). It parses the
result of `paths-filter` and groups the paths by a glob pattern.

## How it works

This action works in 3 steps:

- Create a list that contains directories of the paths.
- Filter out the directories if they don't match the glob pattern.
- Group the directories by the glob pattern

The grouped directories only have the part of the path that matches the glob
pattern.

This action does not provide the functionality to handle complex filtering
rules, such as excluding paths, because the `paths-filter` action already
provides such functionality.

## Example

- Pattern: `docker/*/*`
- Input:
  `["backend/app1/docker/Dockerfile", "backend/app2/docker/Dockerfile", "backend/app2/docker-compose.yml"]`
- Output: `["backend/app1/docker", "backend/app2/docker"]`

## Setup

### Configure the workflow: `dorny/paths-filter`

This action accepts only JSON inputs. Please set `list-files: json`.

```yaml
name: Filter paths and group by
on:
  pull_request:

jobs:
  paths:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    timeout-minutes: 5
    outputs:
      directories: ${{ steps.group-by.outputs.directories }}
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    - name: Filter paths
      uses: dorny/paths-filter@v3
      id: filter
      with:
        list-files: json
        filters: |
          docker:
            - 'docker/**'
    - name: Group by
      uses: tapihdev/paths-group-by@v0
      id: group-by
      with:
        paths: ${{ steps.filter.outputs.docker }}
        glob: docker/*/*

  matrix:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    timeout-minutes: 5
    strategy:
      matrix:
        directory: ${{fromJson(needs.paths.outputs.directories)}}
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      with:
        sparse-checkout: ${{ matrix.directory }}
    - name: Do something
      ...
```

### Inputs

| **Input** | **Required** | **Description**                                                                                                   |
| --------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `paths`   | yes          | The list of paths to group in JSON. (e.g. `["backend/app1/docker/Dockerfile", "backend/app2/docker/Dockerfile"]`) |
| `glob`    | yes          | The glob pattern for grouping the directories of the paths by.<br/>(e.g. `docker/*/*`)                            |

### Outputs

A full set list of possible output values for this action.

| **Output**    | **Description**                                                                              |
| ------------- | -------------------------------------------------------------------------------------------- |
| `directories` | The grouped directories in JSON.<br/>(e.g. `["backend/app1/docker", "backend/app2/docker"]`) |

### PR run permissions

This action itself requires no permission, though `paths-filter` requires
the `contents` and `pull-requests` permissions.
