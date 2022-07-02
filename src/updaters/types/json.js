const stringifyPackage = require('stringify-package');
const detectIndent = require('detect-indent');
const detectNewline = require('detect-newline');

module.exports.readVersion = (contents) => JSON.parse(contents).version;

module.exports.writeVersion = (contents, version) => {
  const json = JSON.parse(contents);
  const { indent } = detectIndent(contents);
  const newline = detectNewline(contents);
  json.version = version;

  if (json.packages && json.packages['']) {
    // package-lock v2 stores version there too
    json.packages[''].version = version;
  }

  return stringifyPackage(json, indent, newline);
};

module.exports.isPrivate = (contents) => JSON.parse(contents).private;
