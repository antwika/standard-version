import bump from './bump';
import checkpoint from '../checkpoint';
import formatCommitMessage from '../format-commit-message';
import { runExecFile } from '../run-execFile';
import { runLifecycleScript } from '../run-lifecycle-script';
import { Args } from '../standard-version';

const execTag = async (newVersion: string, pkgPrivate: boolean, args: Args) => {
  const {
    sign,
    tagPrefix,
    releaseCommitMessageFormat,
    prerelease,
  } = args;
  const tagOption = sign ? '-s' : '-a';
  checkpoint(args, 'tagging release %s%s', [tagPrefix, newVersion]);
  await runExecFile(args, 'git', ['tag', tagOption, tagPrefix + newVersion, '-m', `${formatCommitMessage(releaseCommitMessageFormat, newVersion)}`]);
  const currentBranch = await runExecFile(args, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!currentBranch) {
    throw new Error('The current branch is "undefined" and the execTag function could not properly continue...');
  }

  let message = `git push --follow-tags origin ${currentBranch.trim()}`;
  if (pkgPrivate !== true && bump.getUpdatedConfigs()['package.json']) {
    message += ' && npm publish';
    if (prerelease !== undefined) {
      message += ' --tag ';
      message += prerelease === '' ? 'prerelease' : prerelease;
    }
  }

  checkpoint(args, 'Run `%s` to publish', [message], '[INFO]');
};

export const tag = async (newVersion: string, pkgPrivate: boolean, args: Args) => {
  if (args.skip.tag) return;
  await runLifecycleScript(args, 'pretag');
  await execTag(newVersion, pkgPrivate, args);
  await runLifecycleScript(args, 'posttag');
};
