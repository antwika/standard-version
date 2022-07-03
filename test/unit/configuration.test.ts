import path from 'path';
import findUp from 'find-up';
import fs from 'fs';
import { getConfiguration } from '../../src/configuration';

// eslint-disable-next-line no-var
var validModule1 = jest.fn().mockReturnValue({ foo: 'bar' });

jest.mock('path');
jest.mock('find-up');
jest.mock('fs');
jest.mock('valid-module-1.js', () => validModule1, { virtual: true });
jest.mock('valid-module-2.js', () => ({ foo: 'bar' }), { virtual: true });
jest.mock('invalid-module.js', () => 123, { virtual: true });

describe('configuration', () => {
  it('returns an empty object if no configuration file could be found.', () => {
    jest.spyOn(findUp, 'sync').mockReturnValueOnce(undefined);
    const configuration = getConfiguration();
    expect(configuration).toBeDefined();
    expect(configuration).toStrictEqual({});
  });

  it('returns a populated JSON object if a json configuration file was found.', () => {
    jest.spyOn(findUp, 'sync').mockReturnValueOnce('test.json');
    jest.spyOn(path, 'extname').mockReturnValueOnce('.json');
    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce('{"foo":"bar"}');
    const configuration = getConfiguration();
    expect(configuration).toBeDefined();
    expect(configuration).toStrictEqual({ foo: 'bar' });
  });

  it('throws an error if the resolved config is not an object or function.', () => {
    jest.spyOn(findUp, 'sync').mockReturnValueOnce('invalid-module.js');
    jest.spyOn(path, 'extname').mockReturnValueOnce('.js');
    expect(() => getConfiguration()).toThrowError('[standard-version] Invalid configuration in invalid-module.js provided. Expected an object but found number.');
  });

  it('can resolve a configuration from a module that exports a default function', () => {
    jest.spyOn(findUp, 'sync').mockReturnValueOnce('valid-module-1.js');
    jest.spyOn(path, 'extname').mockReturnValueOnce('.js');
    expect(getConfiguration()).toStrictEqual({ foo: 'bar' });
    expect(validModule1).toHaveBeenCalledTimes(1);
  });

  it('can resolve a configuration from a module that exports a plain object', () => {
    jest.spyOn(findUp, 'sync').mockReturnValueOnce('valid-module-2.js');
    jest.spyOn(path, 'extname').mockReturnValueOnce('.js');
    expect(getConfiguration()).toStrictEqual({ foo: 'bar' });
  });
});
