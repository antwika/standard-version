import conventionalChangelog from 'conventional-changelog';
import fs from 'fs';
import checkpoint from '../checkpoint';
import presetLoader from '../preset-loader';
import { runLifecycleScript } from '../run-lifecycle-script';
import writeFile from '../write-file';

export const START_OF_LAST_RELEASE_PATTERN = /(^#+ \[?\d+\.\d+\.\d+|<a name=)/m;

export const createIfMissing = (args: any) => {
  try {
    fs.accessSync(args.infile, fs.constants.F_OK);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      checkpoint(args, 'created %s', [args.infile]);
      // eslint-disable-next-line no-param-reassign
      args.outputUnreleased = true;
      writeFile(args, args.infile, '\n');
    }
  }
};

// eslint-disable-next-line arrow-body-style
const outputChangelog = (args: any, newVersion: any) => {
  return new Promise((resolve, reject) => {
    createIfMissing(args);
    const { header } = args;

    let oldContent = args.dryRun ? '' : fs.readFileSync(args.infile, 'utf-8');
    const oldContentStart = oldContent.search(START_OF_LAST_RELEASE_PATTERN);
    // find the position of the last release and remove header:
    console.log('oldContentStart:', oldContentStart);
    if (oldContentStart !== -1) {
      oldContent = oldContent.substring(oldContentStart);
    }
    let content = '';
    const context = { version: newVersion };
    const changelogStream = conventionalChangelog({
      debug: args.verbose && console.info.bind(console, 'conventional-changelog'),
      preset: presetLoader(args),
      tagPrefix: args.tagPrefix,
    }, context, { merges: null, path: args.path })
      .on('error', (err: any) => reject(err));

    changelogStream.on('data', (buffer: any) => {
      content += buffer.toString();
    });

    changelogStream.on('end', () => {
      checkpoint(args, 'outputting changes to %s', [args.infile]);
      if (args.dryRun) console.info(`\n---\n${content.trim()}\n---\n`);
      else {
        const trimmed = `${header}\n${(content + oldContent)}`.trimEnd();
        writeFile(args, args.infile, `${trimmed}\n`);
      }
      return resolve(true);
    });
  });
};

async function Changelog(args: any, newVersion: any) {
  if (args.skip.changelog) return;
  await runLifecycleScript(args, 'prechangelog');
  await outputChangelog(args, newVersion);
  await runLifecycleScript(args, 'postchangelog');
}

Changelog.START_OF_LAST_RELEASE_PATTERN = START_OF_LAST_RELEASE_PATTERN;

export const changelog = Changelog;
