import { promisify } from 'util';
import printError from './print-error';

const execFile = promisify(require('child_process').execFile);

const runExecFile = async (args: any, cmd: any, cmdArgs: any) => {
  if (args.dryRun) return undefined;
  try {
    const { stderr, stdout } = await execFile(cmd, cmdArgs);
    // If execFile returns content in stderr, but no error, print it as a warning
    if (stderr) printError(args, stderr, { level: 'warn', color: 'yellow' });
    return stdout;
  } catch (error: any) {
    // If execFile returns an error, print it and exit with return code 1
    printError(args, error.stderr || error.message);
    throw error;
  }
};

export default runExecFile;
