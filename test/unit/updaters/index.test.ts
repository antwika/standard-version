import assert from 'assert';
import { resolveUpdaterObjectFromArgument } from '../../../src/updaters/index';

jest.mock('../../../src/defaults', () => ({
  getDefaults: () => ({ bumpFiles: [] }),
}));

const readVersionMock = jest.fn();
const writeVersionMock = jest.fn();
jest.mock('../../../src/updaters/types/plain-text', () => ({
  readVersion: () => readVersionMock(),
  writeVersion: () => writeVersionMock(),
}));

describe('index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the same input value if it considered a valid updater object.', () => {
    const validUpdater = {
      readVersion: jest.fn(),
      writeVersion: jest.fn(),
    };
    const sameUpdater = resolveUpdaterObjectFromArgument(validUpdater);
    expect(sameUpdater).toBeTruthy();
    assert(sameUpdater !== false);
    sameUpdater.readVersion('content');
    sameUpdater.writeVersion('content', 'version');
    expect(validUpdater.readVersion).toHaveBeenCalledTimes(1);
    expect(validUpdater.writeVersion).toHaveBeenCalledTimes(1);
  });

  it('returns no updater if the passed argument is not resolvable.', () => {
    const noUpdater = resolveUpdaterObjectFromArgument(123 as any);
    expect(noUpdater).toBeFalsy();
  });

  it('can resolve the "plain-text" updater by passing "VERSION.txt" as argument.', () => {
    const plainTextUpdater = resolveUpdaterObjectFromArgument('VERSION.txt');
    expect(plainTextUpdater).toBeTruthy();
    assert(plainTextUpdater !== false);
    plainTextUpdater.readVersion('content');
    plainTextUpdater.writeVersion('content', 'version');
    expect(readVersionMock).toHaveBeenCalledTimes(1);
    expect(writeVersionMock).toHaveBeenCalledTimes(1);
  });

  it('can resolve the "plain-text" updater by passing "plain-text" as updater path.', () => {
    const plainTextUpdater = resolveUpdaterObjectFromArgument({ updater: 'src/updaters/types/plain-text' });
    expect(plainTextUpdater).toBeTruthy();
    assert(plainTextUpdater !== false);
    plainTextUpdater.readVersion('content');
    plainTextUpdater.writeVersion('content', 'version');
    expect(readVersionMock).toHaveBeenCalledTimes(1);
    expect(writeVersionMock).toHaveBeenCalledTimes(1);
  });

  it('failes to resolve updater when a non-existant updater type is passed.', () => {
    const noUpdater = resolveUpdaterObjectFromArgument({ type: 'does-not-exist' });
    expect(noUpdater).toBeFalsy();
  });

  it('failes to resolve updater when a non-supported filename is passed.', () => {
    const noUpdater = resolveUpdaterObjectFromArgument('is-not-supported');
    expect(noUpdater).toBeFalsy();
  });
});
