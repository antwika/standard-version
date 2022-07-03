import figures from 'figures';
import bump from './bump';
import checkpoint from '../checkpoint';
import formatCommitMessage from '../format-commit-message';
import { runExecFile } from '../run-execFile';
import { runLifecycleScript } from '../run-lifecycle-script';

// TODO: This type is incomplete and just types a subset of its properties.
type ExecTagArgs = {
  silent: boolean,
  tagPrefix: string,
  releaseCommitMessageFormat: string,
  skip: {
    tag?: boolean,
  }
  [key: string]: any;
};

async function execTag(newVersion: string, pkgPrivate: boolean, args: ExecTagArgs) {
  let tagOption;
  if (args.sign) {
    tagOption = '-s';
  } else {
    tagOption = '-a';
  }
  checkpoint(args, 'tagging release %s%s', [args.tagPrefix, newVersion]);
  await runExecFile(args, 'git', ['tag', tagOption, args.tagPrefix + newVersion, '-m', `${formatCommitMessage(args.releaseCommitMessageFormat, newVersion)}`]);
  const currentBranch = await runExecFile('', 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
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

  checkpoint(args, 'Run `%s` to publish', [message], figures.info);
}

const Tag = async (newVersion: string, pkgPrivate: boolean, args: ExecTagArgs) => {
  if (args.skip.tag) return;
  await runLifecycleScript(args, 'pretag');
  await execTag(newVersion, pkgPrivate, args);
  await runLifecycleScript(args, 'posttag');
};

export default Tag;
