import path from 'path';
import bump from './bump';
import checkpoint from '../checkpoint';
import formatCommitMessage from '../format-commit-message';
import { runExecFile } from '../run-execFile';
import { runLifecycleScript } from '../run-lifecycle-script';
import { Args } from '../standard-version';

async function execCommit(args: Args, newVersion: string) {
  let msg = 'committing %s';
  let paths: string[] = [];
  const verify = args.verify === false || args.n ? ['--no-verify'] : [];
  const sign = args.sign ? ['-S'] : [];
  const toAdd: string[] = [];

  // only start with a pre-populated paths list when CHANGELOG processing is not skipped
  if (args.infile && !args.skip.changelog) {
    paths = [args.infile];
    toAdd.push(args.infile);
  }

  // commit any of the config files that we've updated
  // the version # for.
  Object.keys(bump.getUpdatedConfigs()).forEach((p) => {
    paths.unshift(p);
    toAdd.push(path.relative(process.cwd(), p));

    // account for multiple files in the output message
    if (paths.length > 1) {
      msg += ' and %s';
    }
  });

  if (args.commitAll) {
    msg += ' and %s';
    paths.push('all staged files');
  }

  checkpoint(args, msg, paths);

  // nothing to do, exit without commit anything
  if (args.skip.changelog && args.skip.bump && toAdd.length === 0) {
    return;
  }

  await runExecFile(args, 'git', ['add'].concat(toAdd));
  await runExecFile(
    args,
    'git',
    [
      'commit',
    ].concat(
      verify,
      sign,
      args.commitAll ? [] : toAdd,
      [
        '-m',
        `${formatCommitMessage(args.releaseCommitMessageFormat, newVersion)}`,
      ],
    ),
  );
}

const Commit = async (args: Args, newVersion: string) => {
  if (args.skip.commit) return;
  const message = await runLifecycleScript(args, 'precommit');
  // eslint-disable-next-line no-param-reassign
  if (message && message.length) args.releaseCommitMessageFormat = message;
  await execCommit(args, newVersion);
  await runLifecycleScript(args, 'postcommit');
};

export default Commit;
