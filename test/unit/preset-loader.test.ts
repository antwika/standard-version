import presetLoader from '../../src/preset-loader';

describe('preset-loader', () => {
  it('resolves the path of the default preset if no specific preset has been defined.', () => {
    const args = {};
    const preset = presetLoader(args);
    expect(preset).toBeDefined();
    expect(typeof preset).toBe('object');
    expect(preset.name).toBeDefined();
    expect(typeof preset.name).toBe('string');
  });
});
