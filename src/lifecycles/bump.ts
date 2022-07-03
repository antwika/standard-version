import fs from 'fs';
import path from 'path';
import semver from 'semver';
import figures from 'figures';
import DotGitignore from 'dotgitignore';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import checkpoint from '../checkpoint';
import presetLoader from '../preset-loader';
import { runLifecycleScript } from '../run-lifecycle-script';
import writeFile from '../write-file';
import { resolveUpdaterObjectFromArgument } from '../updaters';

let configsToUpdate: any = {};

const TypeList = ['major', 'minor', 'patch'].reverse();

/**
 * extract the in-pre-release type in target version
 *
 * @param version
 * @return {string}
 */
function getCurrentActiveType(version: any) {
  for (const type of TypeList) {
    if (semver[type](version)) return type;
  }

  // Unclear to me what should be the default value? Or should an error be thrown instead?
  console.warn(`A call to "getCurrentActiveType" ended up with no active types found and as fallback returned "${TypeList[0]}" ...`);
  return TypeList[0];
}

function isString(val: any) {
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
function shouldContinuePrerelease(version: any, expectType: any) {
  return getCurrentActiveType(version) === expectType;
}

function isInPrerelease(version: any) {
  return Array.isArray(semver.prerelease(version));
}

/**
 * calculate the priority of release type,
 * major - 2, minor - 1, patch - 0
 *
 * @param type
 * @return {number}
 */
function getTypePriority(type: any) {
  return TypeList.indexOf(type);
}

function getReleaseType(prerelease: any, expectedReleaseType: any, currentVersion: any) {
  if (!isString(prerelease)) return expectedReleaseType;
  if (!isInPrerelease(currentVersion)) return `pre${expectedReleaseType}`;

  if (shouldContinuePrerelease(currentVersion, expectedReleaseType)
    || getTypePriority(getCurrentActiveType(currentVersion)) > getTypePriority(expectedReleaseType)
  ) {
    return 'prerelease';
  }

  return `pre${expectedReleaseType}`;
}

function bumpVersion(releaseAs: any, currentVersion: any, args: any) {
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
      }, (err: any, release: any) => {
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
function updateConfigs(args: any, newVersion: any) {
  const dotgit = DotGitignore();
  args.bumpFiles.forEach((bumpFile: any) => {
    const updater = resolveUpdaterObjectFromArgument(bumpFile);
    if (!updater) return;
    if (!updater.filename) return;
    const configPath = path.resolve(process.cwd(), updater.filename);
    try {
      if (dotgit.ignore(configPath)) return;
      const stat = fs.lstatSync(configPath);

      if (!stat.isFile()) return;
      const contents = fs.readFileSync(configPath, 'utf8');
      checkpoint(
        args,
        `bumping version in ${updater.filename} from %s to %s`,
        [updater.readVersion(contents), newVersion],
      );
      writeFile(
        args,
        configPath,
        updater.writeVersion(contents, newVersion),
      );
      // flag any config files that we modify the version # for
      // as having been updated.
      configsToUpdate[updater.filename] = true;
    } catch (err: any) {
      if (err.code !== 'ENOENT') console.warn(err.message);
    }
  });
}

const Bump = async (args: any, version: any) => {
  // reset the cache of updated config files each
  // time we perform the version bump step.
  configsToUpdate = {};

  if (args.skip.bump) return version;
  let newVersion = version;
  await runLifecycleScript(args, 'prerelease');
  const stdout = await runLifecycleScript(args, 'prebump');

  // eslint-disable-next-line no-param-reassign
  if (stdout && stdout.trim().length) args.releaseAs = stdout.trim();
  const release: any = await bumpVersion(args.releaseAs, version, args);
  if (!args.firstRelease) {
    const releaseType = getReleaseType(args.prerelease, release.releaseType, version);
    newVersion = semver.valid(releaseType) || semver.inc(version, releaseType, args.prerelease);
    updateConfigs(args, newVersion);
  } else {
    checkpoint(args, 'skip version bump on first release', [], figures.cross);
  }
  await runLifecycleScript(args, 'postbump');
  return newVersion;
};

Bump.getUpdatedConfigs = () => configsToUpdate;

export const bump = Bump;

export default {
  bump: Bump,
  getUpdatedConfigs: Bump.getUpdatedConfigs,
};
