import path from 'path';
import { getDefaults } from '../defaults';
import * as jsonUpdater from './types/json';
import * as plainTextUpdater from './types/plain-text';

type Updater = {
  readVersion: (contents: string) => string,
  writeVersion: (contents: string, version: string) => string;
  isPrivate?: (contents: string) => boolean,
  filename?: string,
};

const JSON_BUMP_FILES = getDefaults().bumpFiles;

const updatersByType: Record<string, Updater> = {
  json: jsonUpdater,
  'plain-text': plainTextUpdater,
};
const PLAIN_TEXT_BUMP_FILES = ['VERSION.txt', 'version.txt'];

const getUpdaterByType = (type: string) => {
  const updater = updatersByType[type];
  if (!updater) {
    throw Error(`Unable to locate updater for provided type (${type}).`);
  }
  return updater;
};

const getUpdaterByFilename = (filename: string) => {
  if (JSON_BUMP_FILES.includes(path.basename(filename))) {
    return getUpdaterByType('json');
  }
  if (PLAIN_TEXT_BUMP_FILES.includes(filename)) {
    return getUpdaterByType('plain-text');
  }
  throw Error(`Unsupported file (${filename}) provided for bumping.\n Please specify the updater \`type\` or use a custom \`updater\`.`);
};

// eslint-disable-next-line arrow-body-style
const getCustomUpdaterFromPath = (updater: string): Updater | undefined => {
  return require(path.resolve(process.cwd(), updater));
};

/**
 * Simple check to determine if the object provided is a compatible updater.
 */
const isValidUpdater = (obj: Record<string, any>) => (typeof obj === 'object' && typeof obj.readVersion === 'function' && typeof obj.writeVersion === 'function');

export const resolveUpdaterObjectFromArgument = (arg: string | Record<string, any>) => {
  /**
   * If an Object was not provided, we assume it's the path/filename
   * of the updater.
   */

  if (typeof arg === 'object' && isValidUpdater(arg)) {
    return arg as Updater;
  }

  let updater;
  try {
    if (typeof arg === 'object' && typeof arg.updater === 'string') {
      updater = getCustomUpdaterFromPath(arg.updater);
    } else if (typeof arg === 'object' && typeof arg.type === 'string') {
      updater = getUpdaterByType(arg.type);
    } else if (typeof arg === 'string') {
      updater = { ...getUpdaterByFilename(arg), filename: arg };
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') console.warn(`Unable to obtain updater for: ${JSON.stringify(arg)}\n - Error: ${err.message}\n - Skipping...`);
  }
  /**
   * We weren't able to resolve an updater for the argument.
   */
  if (!updater || !isValidUpdater(updater)) {
    return false;
  }

  return updater;
};
