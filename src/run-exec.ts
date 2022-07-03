import { promisify } from 'util';
import { exec } from 'child_process';
import printError from './print-error';

// TODO: This type is incomplete and just types a subset of its properties.
type RunExecArgs = {
  silent?: boolean,
  dryRun?: boolean,
  [key: string]: any;
};

const runExec = async (args: RunExecArgs, cmd: string) => {
  const execPromise = promisify(exec);
  if (args.dryRun) return undefined;
  try {
    const { stderr, stdout } = await execPromise(cmd);
    // If exec returns content in stderr, but no error, print it as a warning
    if (stderr) printError(args, stderr, { level: 'warn', color: 'yellow' });
    return stdout;
  } catch (error: any) {
    // If exec returns an error, print it and exit with return code 1
    printError(args, error.stderr || error.message);
    throw error;
  }
};

export default runExec;
