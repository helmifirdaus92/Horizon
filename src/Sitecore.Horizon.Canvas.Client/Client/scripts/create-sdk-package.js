const fs = require('fs');

const workspacePkg = fs.readFileSync('package.json', { encoding: 'utf-8' });
const workspacePkgJson = JSON.parse(workspacePkg);

const sdkPkg = fs.readFileSync('package.sdk.json', { encoding: 'utf-8' });
const sdkPkgJson = JSON.parse(sdkPkg);

sdkPkgJson.version = workspacePkgJson.version;
console.log('Update package.sdk.json to version', sdkPkgJson.version);


fs.writeFileSync('dist-sdk/package.json', JSON.stringify(sdkPkgJson, null, 2), { encoding: 'utf-8' });
console.log('Write versioned package.sdk.json to dist-sdk/package.json');

