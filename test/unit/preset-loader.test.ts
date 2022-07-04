import presetLoader from '../../src/preset-loader';

jest.mock('conventional-changelog-config-spec', () => ({
  properties: {
    header: {
      type: 'string',
      description: 'A string to be used as the main header section of the CHANGELOG.',
      default: '# Changelog\n\n',
    },
  },
}));

describe('preset-loader', () => {
  it('resolves the path of the default preset if no specific preset has been defined.', () => {
    const preset = presetLoader({});
    expect(preset).toBeDefined();
    expect(typeof preset).toBe('object');
    expect(preset.name).toBeDefined();
    expect(typeof preset.name).toBe('string');
  });

  it('can override the default spec with properties passed via arguments', () => {
    const preset = presetLoader({
      header: {
        type: 'string',
        description: 'An overridden description.',
        default: '# An overridden changelog header\n\n',
      },
    });
    expect(preset.header.description).toBe('An overridden description.');
    expect(preset.header.default).toBe('# An overridden changelog header\n\n');
  });
});
