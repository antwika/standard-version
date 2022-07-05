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
    expect(runExec).toHaveBeenCalledTimes(0);
  });

  it('does not execute anything if "scripts" provided but the specific hook does not exist.', async () => {
    const result = await runLifecycleScript({ silent: true, scripts: {} }, 'hook-name');
    expect(result).not.toBeDefined();
    expect(runExec).toHaveBeenCalledTimes(0);
  });

  it('passes "silent" argument forward to the "checkpoint" function call.', async () => {
    await runLifecycleScript({ silent: true, scripts: { 'hook-name': 'foo -h' } }, 'hook-name');
    expect(checkpoint).toHaveBeenCalledWith(
      { silent: true },
      expect.anything(),
      expect.anything(),
    );
    expect(runExec).toHaveBeenCalledWith({ silent: true, scripts: { 'hook-name': 'foo -h' } }, 'foo -h');
    await runLifecycleScript({ silent: false, scripts: { 'hook-name': 'foo -h' } }, 'hook-name');
    expect(checkpoint).toHaveBeenCalledWith(
      { silent: false },
      expect.anything(),
      expect.anything(),
    );
    expect(runExec).toHaveBeenCalledWith({ silent: false, scripts: { 'hook-name': 'foo -h' } }, 'foo -h');
    expect(runExec).toHaveBeenCalledTimes(2);
  });
});
