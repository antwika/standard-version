import fs from 'fs';
import path from 'path';
import semver from 'semver';
import DotGitignore from 'dotgitignore';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import checkpoint from '../checkpoint';
import presetLoader from '../preset-loader';
import { runLifecycleScript } from '../run-lifecycle-script';
import writeFile from '../write-file';
import { resolveUpdaterObjectFromArgument } from '../updaters';
import { Args } from '../standard-version';

let configsToUpdate: Record<string, boolean> = {};

type SemverTypeName = 'patch' | 'minor' | 'major';

const semverTypePriorityMap: Record<SemverTypeName, number> = ({
  patch: 0,
  minor: 1,
  major: 2,
});

/**
 * extract the in-pre-release type in target version
 *
 * @param version
 * @return {string}
 */
export const getCurrentActiveType = (version: string): SemverTypeName => {
  if (semver.patch(version)) return 'patch';
  if (semver.minor(version)) return 'minor';
  if (semver.major(version)) return 'major';
  // Unclear to me what should be the default value? Or should an error be thrown instead?
  return 'patch';
};

const isString = (val: any) => typeof val === 'string';

/**
 * if a version is currently in pre-release state,
 * and if it current in-pre-release type is same as expect type,
 * it should continue the pre-release with the same type
 *
 * @param version
 * @param expectType
 * @return {boolean}
 */
const shouldContinuePrerelease = (
  version: string,
  expectType: SemverTypeName,
) => getCurrentActiveType(version) === expectType;

const isInPrerelease = (version: string) => Array.isArray(semver.prerelease(version));

/**
 * calculate the priority of release type,
 * major - 2, minor - 1, patch - 0
 *
 * @param type
 * @return {number}
 */
export const getTypePriority = (type: SemverTypeName) => semverTypePriorityMap[type];

const getReleaseType = (
  prerelease: any,
  expectedReleaseType: SemverTypeName,
  currentVersion: string,
) => {
  if (!isString(prerelease)) return expectedReleaseType;
  if (!isInPrerelease(currentVersion)) return `pre${expectedReleaseType}`;

  if (shouldContinuePrerelease(currentVersion, expectedReleaseType)
    || getTypePriority(getCurrentActiveType(currentVersion)) > getTypePriority(expectedReleaseType)
  ) {
    return 'prerelease';
  }

  return `pre${expectedReleaseType}`;
};

// eslint-disable-next-line arrow-body-style
const bumpVersion = (releaseAs: any, currentVersion: string, args: any) => {
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
};

/**
 * attempt to update the version number in provided `bumpFiles`
 * @param args config object
 * @param newVersion version number to update to.
 * @return void
 */
function updateConfigs(args: Args, newVersion: string) {
  const dotgit = DotGitignore();
  args.bumpFiles.forEach((bumpFile) => {
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

const Bump = async (args: any, version: string) => {
  // reset the cache of updated config files each
  // time we perform the version bump step.
  configsToUpdate = {};

  if (args.skip.bump) return version;
  await runLifecycleScript(args, 'prerelease');
  const stdout = await runLifecycleScript(args, 'prebump');

  // eslint-disable-next-line no-param-reassign
  if (stdout && stdout.trim().length) args.releaseAs = stdout.trim();
  const release: any = await bumpVersion(args.releaseAs, version, args);
  let newVersion = version;
  if (!args.firstRelease) {
    const releaseType = getReleaseType(args.prerelease, release.releaseType, version) as any;
    const temp = semver.valid(releaseType) || semver.inc(version, releaseType, args.prerelease);
    if (temp === null) throw new Error(`Failed to bump version, the provided version is not valid ${version}`);
    updateConfigs(args, temp);
    newVersion = temp;
  } else {
    checkpoint(args, 'skip version bump on first release', [], '[SKIP]');
  }
  await runLifecycleScript(args, 'postbump');
  return newVersion;
};

export const bump = Bump;

export default {
  bump: Bump,
  getUpdatedConfigs: () => configsToUpdate,
};
