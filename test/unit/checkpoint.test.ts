import checkpoint from '../../src/checkpoint';

describe('checkpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('can prefix the message with a custom/overridden figure', () => {
    jest.spyOn(global.console, 'info').mockImplementation();
    checkpoint({ silent: false }, 'Test', [], 'X');
    expect(console.info).toHaveBeenCalledWith('X Test');
  });

  it('should not output the message if the "silent" is set to "true"', () => {
    jest.spyOn(global.console, 'info').mockImplementation();
    checkpoint({ silent: true }, 'Should not be logged', []);
    expect(console.info).not.toHaveBeenCalled();
  });

  it('should use the default figure, if none was provided.', () => {
    jest.spyOn(global.console, 'info').mockImplementation();
    checkpoint({ silent: false }, 'Test', []);
    expect(console.info).toHaveBeenCalledWith('[OK] Test');
  });
});
