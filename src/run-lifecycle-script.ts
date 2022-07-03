import chalk from 'chalk';
import figures from 'figures';
import checkpoint from './checkpoint';
import runExec from './run-exec';

// TODO: This type is incomplete and just types a subset of its properties.
type RunLifecycleScriptArgs = {
  scripts?: Record<string, string>,
  silent?: boolean,
  [key: string]: any;
};

const runLifecycleScript = async (args: RunLifecycleScriptArgs, hookName: string) => {
  const { scripts, silent } = args;
  if (!scripts || !scripts[hookName]) return undefined;
  const command = scripts[hookName];
  if (!silent) {
    checkpoint({ silent: !!silent }, 'Running lifecycle script "%s"', [hookName]);
    checkpoint({ silent: !!silent }, '- execute command: "%s"', [command], chalk.blue(figures.info));
  }
  return runExec(args, command);
};

export default runLifecycleScript;
