import checkpoint from './checkpoint';
import runExec from './run-exec';
import { Args } from './standard-version';

export const runLifecycleScript = async (args: Args, hookName: string) => {
  const { scripts, silent } = args;
  if (!scripts || !scripts[hookName]) return undefined;
  const command = scripts[hookName];
  console.log('command:', command);
  checkpoint({ silent }, 'Running lifecycle script "%s"', [hookName]);
  checkpoint({ silent }, '- execute command: "%s"', [command], '[INFO]');
  return runExec(args, command);
};

export default {
  runLifecycleScript,
};
