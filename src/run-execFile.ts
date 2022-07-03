import { promisify } from 'util';
import { execFile } from 'child_process';
import printError from './print-error';

// TODO: This type is incomplete and just types a subset of its properties.
type RunExecFileArgs = string | {
  silent?: boolean,
  dryRun?: boolean,
  [key: string]: any;
};

// TODO: This type is incomplete and just types a subset of its properties.
type RunExecFileCmdArgs = string[] | null | undefined;

export const runExecFile = async (
  args: RunExecFileArgs,
  cmd: string,
  cmdArgs: RunExecFileCmdArgs,
) => {
  const execFilePromise = promisify(execFile);
  if (typeof args === 'string') return undefined;
  if (args.dryRun) return undefined;
  try {
    const { stderr, stdout } = await execFilePromise(cmd, cmdArgs);
    // If execFile returns content in stderr, but no error, print it as a warning
    if (stderr) printError(args, stderr, { level: 'warn', color: 'yellow' });
    return stdout;
  } catch (error: any) {
    // If execFile returns an error, print it and exit with return code 1
    printError(args, error.stderr || error.message);
    throw error;
  }
};

export default {
  runExecFile,
};
