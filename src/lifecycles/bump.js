const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const figures = require('figures');
const DotGitignore = require('dotgitignore');
const conventionalRecommendedBump = require('conventional-recommended-bump');
const checkpoint = require('../checkpoint');
const presetLoader = require('../preset-loader');
const runLifecycleScript = require('../run-lifecycle-script');
const writeFile = require('../write-file').default;
const { resolveUpdaterObjectFromArgument } = require('../updaters');

let configsToUpdate = {};

const TypeList = ['major', 'minor', 'patch'].reverse();

/**
 * extract the in-pre-release type in target version
 *
 * @param version
 * @return {string}
 */
function getCurrentActiveType(version) {
  for (const type of TypeList) {
    if (semver[type](version)) return type;
  }

  // Unclear to me what should be the default value? Or should an error be thrown instead?
  console.warn(`A call to "getCurrentActiveType" ended up with no active types found and as fallback returned "${TypeList[0]}" ...`);
  return TypeList[0];
}

function isString(val) {
  return typeof val === 'string';
}

/**
 * if a version is currently in pre-release state,
 * and if it current in-pre-release type is same as expect type,
 * it should continue the pre-release with the same type
 *
 * @param version
 * @param expectType
 * @return {boolean}
 */
function shouldContinuePrerelease(version, expectType) {
  return getCurrentActiveType(version) === expectType;
}

function isInPrerelease(version) {
  return Array.isArray(semver.prerelease(version));
}

/**
 * calculate the priority of release type,
 * major - 2, minor - 1, patch - 0
 *
 * @param type
 * @return {number}
 */
function getTypePriority(type) {
  return TypeList.indexOf(type);
}

function getReleaseType(prerelease, expectedReleaseType, currentVersion) {
  if (!isString(prerelease)) return expectedReleaseType;
  if (!isInPrerelease(currentVersion)) return `pre${expectedReleaseType}`;

  if (shouldContinuePrerelease(currentVersion, expectedReleaseType)
    || getTypePriority(getCurrentActiveType(currentVersion)) > getTypePriority(expectedReleaseType)
  ) {
    return 'prerelease';
  }

  return `pre${expectedReleaseType}`;
}

function bumpVersion(releaseAs, currentVersion, args) {
  return new Promise((resolve, reject) => {
    if (releaseAs) {
      resolve({
        releaseType: releaseAs,
      });
    } else {
      const presetOptions = presetLoader(args);
      if (typeof presetOptions === 'object') {
        if (semver.lt(currentVersion, '1.0.0')) presetOptions.preMajor = true;
      }
      conventionalRecommendedBump({
        debug: args.verbose && console.info.bind(console, 'conventional-recommended-bump'),
        preset: presetOptions,
        path: args.path,
        tagPrefix: args.tagPrefix,
        lernaPackage: args.lernaPackage,
      }, (err, release) => {
        if (err) reject(err);
        else resolve(release);
      });
    }
  });
}

/**
 * attempt to update the version number in provided `bumpFiles`
 * @param args config object
 * @param newVersion version number to update to.
 * @return void
 */
function updateConfigs(args, newVersion) {
  const dotgit = DotGitignore();
  args.bumpFiles.forEach((bumpFile) => {
    const updater = resolveUpdaterObjectFromArgument(bumpFile);
    if (!updater) {
      return;
    }
    const configPath = path.resolve(process.cwd(), updater.filename);
    try {
      if (dotgit.ignore(configPath)) return;
      const stat = fs.lstatSync(configPath);

      if (!stat.isFile()) return;
      const contents = fs.readFileSync(configPath, 'utf8');
      checkpoint(
        args,
        `bumping version in ${updater.filename} from %s to %s`,
        [updater.updater.readVersion(contents), newVersion],
      );
      writeFile(
        args,
        configPath,
        updater.updater.writeVersion(contents, newVersion),
      );
      // flag any config files that we modify the version # for
      // as having been updated.
      configsToUpdate[updater.filename] = true;
    } catch (err) {
      if (err.code !== 'ENOENT') console.warn(err.message);
    }
  });
}

async function Bump(args, version) {
  // reset the cache of updated config files each
  // time we perform the version bump step.
  configsToUpdate = {};

  if (args.skip.bump) return version;
  let newVersion = version;
  await runLifecycleScript(args, 'prerelease');
  const stdout = await runLifecycleScript(args, 'prebump');
  // eslint-disable-next-line no-param-reassign
  if (stdout && stdout.trim().length) args.releaseAs = stdout.trim();
  const release = await bumpVersion(args.releaseAs, version, args);
  if (!args.firstRelease) {
    const releaseType = getReleaseType(args.prerelease, release.releaseType, version);
    newVersion = semver.valid(releaseType) || semver.inc(version, releaseType, args.prerelease);
    updateConfigs(args, newVersion);
  } else {
    checkpoint(args, 'skip version bump on first release', [], chalk.red(figures.cross));
  }
  await runLifecycleScript(args, 'postbump');
  return newVersion;
}

Bump.getUpdatedConfigs = () => configsToUpdate;

module.exports = Bump;
