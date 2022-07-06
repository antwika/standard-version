import index from '../../src/index';
import { standardVersion } from '../../src/standard-version';

jest.mock('../../src/standard-version');

describe('index', () => {
  it('forwards all arguments to "standard-version"', async () => {
    const args = {
      releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
      tagPrefix: 'v',
      skip: {},
      silent: true,
      header: '# Test change log\n',
      packageFiles: ['custom-package-file'],
      bumpFiles: [],
      preset: {},
    };

    await index(args);
    expect(standardVersion).toHaveBeenCalledWith(args);
  });
});
