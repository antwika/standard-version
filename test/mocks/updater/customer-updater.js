const REPLACER = /version: "(.*)"/;

module.exports.readVersion = (contents) => REPLACER.exec(contents)[1];

module.exports.writeVersion = (contents, version) => contents.replace(
  REPLACER.exec(contents)[0],
  `version: "${version}"`,
);
