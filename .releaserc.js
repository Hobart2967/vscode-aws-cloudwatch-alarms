module.exports = {
  "branches": ["main"],
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "angular",
        "releaseRules": [
          { "type": "docs", "scope": "README", "release": "patch" },
          { "type": "refactor", "release": "patch" },
          { "type": "style", "release": "patch" }
        ],
        "parserOpts": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES"]
        }
      }
    ],
    [
      "@semantic-release/npm",
      {
        "npmPublish": false,
        "tarballDir": "pkg-dist"
      }
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
    ["@semantic-release/git", {
      "assets": ["package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],

    // Deploy Visual Studio Extension to market place
    ["@semantic-release/exec", {
      "publishCmd": "vsce publish -p " + process.env.AZURE_TOKEN
    }],
  ]
}