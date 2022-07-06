import gitSemverTags from 'git-semver-tags';
import semver from 'semver';
import util from 'util';

export const latestSemverTag = async (tagPrefix: string) => {
  const gitSemverTagsPromise = util.promisify(gitSemverTags);
  const tags: string[] = await gitSemverTagsPromise({ tagPrefix });
  const sortedTags = tags.map((tag) => tag.replace(new RegExp(`^${tagPrefix}`), ''))
    .map((tag) => semver.clean(tag))
    .filter((x): x is string => x !== null)
    .sort(semver.rcompare);

  return sortedTags.length > 0 ? sortedTags[0] : '1.0.0';
};
