import util from 'util';
import latestSemverTag from '../../src/latest-semver-tag';

// eslint-disable-next-line no-var
var cleanMock = jest.fn();
// eslint-disable-next-line no-var
var rcompareMock = jest.fn();

jest.mock('semver', () => ({
  clean: (...args: any) => cleanMock(...args),
  rcompare: (...args: any) => rcompareMock(...args),
}));

jest.mock('util');

describe('latest-semver-tag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns by default version "1.0.0" if no tags exist in the repository.', async () => {
    jest.spyOn(util, 'promisify').mockImplementationOnce(() => async () => []);
    cleanMock.mockImplementation((version: string) => version);
    const latestTag = await latestSemverTag('v');
    expect(latestTag).toStrictEqual('1.0.0');
  });

  it('correctly cleans, sorts and finds the latest tag in the repository.', async () => {
    jest.spyOn(util, 'promisify').mockImplementationOnce(() => async () => ['v2.0.0', 'v1.0.0', 'v0.6.1']);
    cleanMock.mockImplementation((version: string) => version);
    rcompareMock.mockImplementation(() => 1);
    const latestTag = await latestSemverTag('v');
    expect(cleanMock).toHaveBeenCalledWith('2.0.0');
    expect(cleanMock).toHaveBeenCalledWith('1.0.0');
    expect(cleanMock).toHaveBeenCalledWith('0.6.1');
    expect(rcompareMock).toHaveBeenCalledWith('1.0.0', '2.0.0');
    expect(rcompareMock).toHaveBeenCalledWith('0.6.1', '1.0.0');
    expect(latestTag).toStrictEqual('2.0.0');
  });
});
