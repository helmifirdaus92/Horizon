module.exports = {
  "roots": [
    "<rootDir>/contract-tests"
  ],
  "testMatch": [
    "**/contract-tests/**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "reporters": [ "default", "jest-teamcity" ]
}