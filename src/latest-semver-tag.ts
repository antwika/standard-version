import gitSemverTags from 'git-semver-tags';
import semver from 'semver';
import util from 'util';

const latestSemverTag = async (tagPrefix?: string) => {
  const gitSemverTagsPromise = util.promisify(gitSemverTags);
  const tags: string[] = await gitSemverTagsPromise({ tagPrefix });
  if (tags.length === 0) {
    return '1.0.0';
  }

  // Respect tagPrefix
  let temp = tags.map((tag) => tag.replace(new RegExp(`^${tagPrefix}`), ''));
  // ensure that the largest semver tag is at the head.
  temp = temp.map((tag) => semver.clean(tag));
  temp.sort(semver.rcompare);
  const latestTag = temp[0];
  return latestTag;
};

export default latestSemverTag;
