# api.blueberrymc.net

## Routes

```http request
GET /projects
```
Returns: All projects

Example response (`/projects`):
```json
{
  "projects": [
    {
      "id": 1,
      "name": "blueberry",
      "description": "Blueberry project",
      "created_at": 1655161019000,
      "repo_url": "https://github.com/BlueberryMC/Blueberry"
    }
  ]
}
```

---

```http request
GET /projects/:project/version_groups
```
Returns: All version groups for a project

Example response (`/projects/blueberry/version_groups`):
```json
{
  "version_groups": [
    {
      "id": 1,
      "project_id": 1,
      "name": "1.19",
      "description": "Active development for 1.19",
      "created_at": 1655161326000,
      "experimental": false,
      "legacy": false,
      "branch": "main"
    },
    {
      "id": 2,
      "project_id": 1,
      "name": "1.18",
      "description": "Active development for 1.18",
      "created_at": 1655161345000,
      "experimental": false,
      "legacy": false,
      "branch": "ver/1.18.2"
    }
  ]
}
```

---

```http request
GET /projects/:project/version_groups/:versionGroup/builds
```
Returns: All builds for a version group

Example response (`/projects/blueberry/version_groups/1.19/builds`):
```json
{
  "builds": [
    {
      "id": 1,
      "version_id": 1,
      "build_number": 78,
      "experimental": false,
      "promoted": false,
      "changes": [
        {
          "id": 1,
          "build_id": 1,
          "sha": "d6f53e151b5d57276acb5752b24db652d83434d2",
          "description": "Turn off cache for now"
        }
      ],
      "files": [
        {
          "id": 1,
          "build_id": 1,
          "type": "universal-installer",
          "download_url": "https://github.com/BlueberryMC/Blueberry/releases/download/1.19-1.5.0.78/blueberry-1.19-1.5.0.78-installer.jar"
        }
      ],
      "full": true
    },
    {
      "id": 2,
      "version_id": 1,
      "build_number": 76,
      "experimental": false,
      "promoted": false,
      "changes": [
        {
          "id": 2,
          "build_id": 2,
          "sha": "5fea9dcc5a3101e7cf67fe1611b9a613f065952e",
          "description": "Pass -P for test"
        }
      ],
      "files": [
        {
          "id": 2,
          "build_id": 2,
          "type": "universal-installer",
          "download_url": "https://github.com/BlueberryMC/Blueberry/releases/download/1.19-1.5.0.76/blueberry-1.19-1.5.0.76-installer.jar"
        }
      ],
      "full": true
    }
  ]
}
```

---

```http request
GET /projects/:project/version_groups/:versionGroup/builds/:buildNumber/download
```
Returns: All downloadable files for a build

Example response (`/projects/blueberry/version_groups/1.19/builds/78/download`):
```json
{
  "files": [
    {
      "id": 1,
      "build_id": 1,
      "type": "universal-installer",
      "download_url": "https://github.com/BlueberryMC/Blueberry/releases/download/1.19-1.5.0.78/blueberry-1.19-1.5.0.78-installer.jar"
    }
  ]
}
```

---

```http request
GET /projects/:project/version_groups/:versionGroup/builds/:buildNumber/download/:downloadType
```
```http request
GET /projects/:project/version_groups/:versionGroup/builds/:buildNumber/download/:downloadType/:anything
```
Downloads a file by redirecting to download_url. If there are multiple files for one type, only one file will be downloaded.

---

```http request
GET /projects/:project/versions
```
Returns: All versions (not groups!) for a project

Example response (`/projects/blueberry/versions`):
```json
{
  "versions": [
    {
      "id": 1,
      "version_group_id": 1,
      "name": "1.19-1.5.0"
    },
    {
      "id": 2,
      "version_group_id": 2,
      "name": "1.18.2-1.4.2"
    }
  ]
}
```

---

```http request
GET /projects/:project/versions/:version
```
Returns: All builds for a version

Example response (`/projects/blueberry/versions/1.19-1.5.0`):
```json
{
  "builds": [
    {
      "id": 2,
      "version_id": 1,
      "build_number": 76,
      "experimental": false,
      "promoted": false,
      "changes": [
        {
          "id": 2,
          "build_id": 2,
          "sha": "5fea9dcc5a3101e7cf67fe1611b9a613f065952e",
          "description": "Pass -P for test"
        }
      ],
      "files": [
        {
          "id": 2,
          "build_id": 2,
          "type": "universal-installer",
          "download_url": "https://github.com/BlueberryMC/Blueberry/releases/download/1.19-1.5.0.76/blueberry-1.19-1.5.0.76-installer.jar"
        }
      ],
      "full": true
    },
    {
      "id": 1,
      "version_id": 1,
      "build_number": 78,
      "experimental": false,
      "promoted": false,
      "changes": [
        {
          "id": 1,
          "build_id": 1,
          "sha": "d6f53e151b5d57276acb5752b24db652d83434d2",
          "description": "Turn off cache for now"
        }
      ],
      "files": [
        {
          "id": 1,
          "build_id": 1,
          "type": "universal-installer",
          "download_url": "https://github.com/BlueberryMC/Blueberry/releases/download/1.19-1.5.0.78/blueberry-1.19-1.5.0.78-installer.jar"
        }
      ],
      "full": true
    }
  ]
}
```
