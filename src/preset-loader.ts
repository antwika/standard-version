// TODO: this should be replaced with an object we maintain and
// describe in: https://github.com/conventional-changelog/conventional-changelog-config-spec
import spec from 'conventional-changelog-config-spec';

const presetLoader = (args: any) => {
  // It's unclear to me how to properly mock 'require.resolve' calls...
  const defaultPreset = require.resolve('conventional-changelog-conventionalcommits');

  let preset = args.preset || defaultPreset;
  if (preset === defaultPreset) {
    preset = {
      name: defaultPreset,
    };
    Object.keys(spec.properties).forEach((key) => {
      if (args[key] !== undefined) preset[key] = args[key];
    });
  }

  return preset;
};

export default presetLoader;
