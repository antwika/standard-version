import gitSemverTags from 'git-semver-tags';
import semver from 'semver';
import util from 'util';

const gitSemverTagsPromise = util.promisify(gitSemverTags);

const latestSemverTag = async (tagPrefix = undefined) => {
  const tags = await gitSemverTagsPromise({ tagPrefix });
  if (tags.length === 0) {
    return '1.0.0';
  }

  // Respect tagPrefix
  let temp = tags.map((tag: any) => tag.replace(new RegExp(`^${tagPrefix}`), ''));
  // ensure that the largest semver tag is at the head.
  temp = temp.map((tag: any) => semver.clean(tag));
  temp.sort(semver.rcompare);
  return temp[0];
};

export default latestSemverTag;
