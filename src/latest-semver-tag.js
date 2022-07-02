const gitSemverTags = require('git-semver-tags');
const semver = require('semver');
const util = require('util');

const gitSemverTagsPromise = util.promisify(gitSemverTags);

const latestSemverTag = async (tagPrefix = undefined) => {
  const tags = await gitSemverTagsPromise({ tagPrefix });
  if (tags.length === 0) return '1.0.0';

  // Respect tagPrefix
  let temp = tags.map((tag) => tag.replace(new RegExp(`^${tagPrefix}`), ''));
  // ensure that the largest semver tag is at the head.
  temp = temp.map((tag) => semver.clean(tag));
  temp.sort(semver.rcompare);
  return temp[0];
};

module.exports = latestSemverTag;
