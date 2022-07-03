import { changelog } from '../../../src/lifecycles/changelog';
import { runLifecycleScript } from '../../../src/run-lifecycle-script';
import writeFile from '../../../src/write-file';

jest.mock('../../../src/run-lifecycle-script');
jest.mock('../../../src/write-file');

describe('changelog', () => {
  it('does not do anything if skipping changelog is set to "true".', async () => {
    const result = await changelog({ skip: { changelog: true } }, '1.2.3');
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
    expect(runLifecycleScript).toHaveBeenCalledWith(
      {
        infile: 'CHANGELOG.md',
        skip: { changelog: false },
      },
      'prechangelog',
    );
    expect(writeFile).toBeDefined();
    // TODO: Check the content of the produced changelog...
  });
});
