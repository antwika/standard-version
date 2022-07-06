import fs from 'fs';
import writeFile from '../../src/write-file';

jest.mock('fs');

describe('write-file', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not write to any file if argument "dryRun" is set to "true".', async () => {
    const result = writeFile({ dryRun: true } as any, 'filepath', 'content');
    expect(result).not.toBeDefined();
  });

  it('writes content to file if argument "dryRun" is not "true".', async () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const result = writeFile({ dryRun: false } as any, 'filepath', 'content');
    expect(result).not.toBeDefined();
    expect(fs.writeFileSync).toHaveBeenCalledWith('filepath', 'content', 'utf8');
  });
});
