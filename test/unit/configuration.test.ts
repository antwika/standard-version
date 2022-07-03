import path from 'path';
import findUp from 'find-up';
import fs from 'fs';
import { getConfiguration } from '../../src/configuration';

jest.mock('path');
jest.mock('find-up');
jest.mock('fs');

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
});
