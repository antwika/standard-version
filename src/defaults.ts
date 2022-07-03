import spec from 'conventional-changelog-config-spec';

export const getDefaults = () => {
  const defaults = {
    infile: 'CHANGELOG.md',
    firstRelease: false,
    sign: false,
    noVerify: false,
    commitAll: false,
    silent: false,
    tagPrefix: 'v',
    scripts: {},
    skip: {},
    dryRun: false,
    gitTagFallback: true,
    preset: require.resolve('conventional-changelog-conventionalcommits'),
    header: '# Changelog\n\nAll notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.\n',
    types: spec.properties.types.default,
    preMajor: spec.properties.preMajor.default,
    commitUrlFormat: spec.properties.commitUrlFormat.default,
    compareUrlFormat: spec.properties.compareUrlFormat.default,
    issueUrlFormat: spec.properties.issueUrlFormat.default,
    userUrlFormat: spec.properties.userUrlFormat.default,
    releaseCommitMessageFormat: spec.properties.releaseCommitMessageFormat.default,
    issuePrefixes: spec.properties.issuePrefixes.default,
    packageFiles: [
      'package.json',
      'bower.json',
      'manifest.json',
    ],
    bumpFiles: [
      'package.json',
      'bower.json',
      'manifest.json',
      'package-lock.json',
      'npm-shrinkwrap.json',
    ],
  };

  return defaults;
};
