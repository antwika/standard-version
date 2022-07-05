import { runLifecycleScript } from '../../src/run-lifecycle-script';
import runExec from '../../src/run-exec';
import checkpoint from '../../src/checkpoint';

jest.mock('../../src/run-exec');
jest.mock('../../src/checkpoint');

describe('run-lifecycle-script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not execute anything if there is no "scripts" provided in the arguments.', async () => {
    const result = await runLifecycleScript({ silent: true }, 'hook-name');
    expect(result).not.toBeDefined();
  });

  it('does not execute anything if "scripts" provided but the specific hook does not exist.', async () => {
    const result = await runLifecycleScript({ silent: true, scripts: {} }, 'hook-name');
    expect(result).not.toBeDefined();
  });

  it('does not print anything if specific hook exists but the argument "silent" is set to "true".', async () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    await runLifecycleScript({ silent: true, scripts: { 'hook-name': 'foo -h' } }, 'hook-name');
    expect(console.error).not.toHaveBeenCalled();
    expect(runExec).toHaveBeenCalledWith({ scripts: { 'hook-name': 'foo -h' }, silent: true }, 'foo -h');
  });

  it('does call the checkpoint function to output messages if silent is "false".', async () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    await runLifecycleScript({ silent: false, scripts: { 'hook-name': 'foo -h' } }, 'hook-name');
    expect(console.error).not.toHaveBeenCalled();
    expect(runExec).toHaveBeenCalledWith({ scripts: { 'hook-name': 'foo -h' }, silent: false }, 'foo -h');
    expect(checkpoint).toHaveBeenCalledWith({ silent: false }, 'Running lifecycle script "%s"', ['hook-name']);
    expect(checkpoint).toHaveBeenCalledWith({ silent: false }, '- execute command: "%s"', ['foo -h'], expect.anything());
  });

  it('does not call the checkpoint function to output messages if silent is "undefined".', async () => {
    jest.spyOn(global.console, 'error').mockImplementation();
    await runLifecycleScript({ silent: undefined, scripts: { 'hook-name': 'foo -h' } }, 'hook-name');
    expect(console.error).not.toHaveBeenCalled();
    expect(runExec).toHaveBeenCalledWith({ scripts: { 'hook-name': 'foo -h' }, silent: undefined }, 'foo -h');
    expect(checkpoint).not.toHaveBeenCalled();
  });
});
