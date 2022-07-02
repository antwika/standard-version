import chalk from 'chalk';
import figures from 'figures';
import checkpoint from './checkpoint';
import runExec from './run-exec';

const runLifecycleScript = async (args: any, hookName: any) => {
  const { scripts } = args;
  if (!scripts || !scripts[hookName]) return undefined;
  const command = scripts[hookName];
  checkpoint(args, 'Running lifecycle script "%s"', [hookName]);
  checkpoint(args, '- execute command: "%s"', [command], chalk.blue(figures.info));
  return runExec(args, command);
};

export default runLifecycleScript;
