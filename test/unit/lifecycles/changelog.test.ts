import fs from 'fs';
import { changelog, createIfMissing } from '../../../src/lifecycles/changelog';
import { runLifecycleScript } from '../../../src/run-lifecycle-script';
import writeFile from '../../../src/write-file';
import checkpoint from '../../../src/checkpoint';

jest.mock('../../../src/run-lifecycle-script');
jest.mock('../../../src/write-file');
jest.mock('../../../src/checkpoint');

describe('changelog', () => {
  it('does not do anything if skipping changelog is set to "true".', async () => {
    const result = await changelog({ skip: { changelog: true } }, '1.2.3');
    expect(result).toBeUndefined();
  });

  it('produces an expected changelog to console when argument "dryRun" is "true".', async () => {
    const result = await changelog(
      {
        dryRun: true,
        infile: 'CHANGELOG.md',
        skip: { changelog: false },
      },
      '1.2.3',
    );
    expect(result).toBeUndefined();
  });

  it('produces an expected changelog.', async () => {
    const result = await changelog(
      {
        infile: 'CHANGELOG.md',
        skip: { changelog: false },
      },
      '1.2.3',
    );
    expect(result).toBeUndefined();
    expect(runLifecycleScript).toHaveBeenCalledWith(expect.anything(), 'prechangelog');
    expect(writeFile).toBeDefined();
    // TODO: Check the content of the produced changelog...
  });

  it('can lazily create files if missing.', () => {
    jest.mock('fs');
    // eslint-disable-next-line no-throw-literal
    jest.spyOn(fs, 'accessSync').mockImplementationOnce(() => { throw { code: 'ENOENT' }; });
    createIfMissing({ infile: 'test-infile.txt', foo: 'bar' });
    expect(fs.accessSync).toHaveBeenCalledWith('test-infile.txt', expect.anything());
    expect(checkpoint).toHaveBeenCalledWith(expect.anything(), 'created %s', ['test-infile.txt']);
    expect(writeFile).toHaveBeenCalledWith(expect.anything(), 'test-infile.txt', '\n');
  });
});
