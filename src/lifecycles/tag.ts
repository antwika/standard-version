import bump from './bump';
import checkpoint from '../checkpoint';
import formatCommitMessage from '../format-commit-message';
import { runExecFile } from '../run-execFile';
import { runLifecycleScript } from '../run-lifecycle-script';
import { Args } from '../standard-version';

const execTag = async (newVersion: string, pkgPrivate: boolean, args: Args) => {
  let tagOption;
  if (args.sign) {
    tagOption = '-s';
  } else {
    tagOption = '-a';
  }
  checkpoint(args, 'tagging release %s%s', [args.tagPrefix, newVersion]);
  await runExecFile(args, 'git', ['tag', tagOption, args.tagPrefix + newVersion, '-m', `${formatCommitMessage(args.releaseCommitMessageFormat, newVersion)}`]);
  const currentBranch = await runExecFile(args, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (currentBranch === undefined) {
    throw new Error('The current branch is "undefined" and the execTag function could not properly continue...');
  }
  let message = `git push --follow-tags origin ${currentBranch.trim()}`;
  if (pkgPrivate !== true && bump.getUpdatedConfigs()['package.json']) {
    message += ' && npm publish';
    if (args.prerelease !== undefined) {
      if (args.prerelease === '') {
        message += ' --tag prerelease';
      } else {
        message += ` --tag ${args.prerelease}`;
      }
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
