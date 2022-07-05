import { promisify } from 'util';
import { execFile } from 'child_process';
import printError from './print-error';

type RunExecFileArgs = {
  silent?: boolean,
  dryRun?: boolean,
};

type RunExecFileCmdArgs = string[];

export const runExecFile = async (
  args: RunExecFileArgs,
  cmd: string,
  cmdArgs: RunExecFileCmdArgs,
) => {
  const execFilePromise = promisify(execFile);
  if (args.dryRun) return undefined;
  try {
    const { stderr, stdout } = await execFilePromise(cmd, cmdArgs);
    // If execFile returns content in stderr, but no error, print it as a warning
    if (stderr) printError(args, stderr, 'warn');
    return stdout;
  } catch (error: any) {
    // If execFile returns an error, print it and exit with return code 1
    printError(args, error.stderr || error.message, 'error');
    throw error;
  }
};

export default {
  runExecFile,
};
