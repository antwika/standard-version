import { promisify } from 'util';
import printError from './print-error';

const exec = promisify(require('child_process').exec);

const runExec = async (args: any, cmd: any) => {
  if (args.dryRun) return undefined;
  try {
    const { stderr, stdout } = await exec(cmd);
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
