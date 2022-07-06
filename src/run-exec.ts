import { promisify } from 'util';
import { exec } from 'child_process';
import printError from './print-error';
import { Args } from './standard-version';

const runExec = async (args: Args, cmd: string) => {
  const execPromise = promisify(exec);
  if (args.dryRun) return undefined;
  try {
    const { stderr, stdout } = await execPromise(cmd);
    // If exec returns content in stderr, but no error, print it as a warning
    if (stderr) printError(args, stderr, 'warn');
    return stdout;
  } catch (error: any) {
    // If exec returns an error, print it and exit with return code 1
    printError(args, error.stderr || error.message, 'error');
    throw error;
  }
};

export default runExec;
