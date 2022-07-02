const chalk = require('chalk');
const conventionalChangelog = require('conventional-changelog');
const fs = require('fs');
const checkpoint = require('../checkpoint');
const presetLoader = require('../preset-loader');
const runLifecycleScript = require('../run-lifecycle-script');
const writeFile = require('../write-file').default;

const START_OF_LAST_RELEASE_PATTERN = /(^#+ \[?\d+\.\d+\.\d+|<a name=)/m;

function createIfMissing(args) {
  try {
    fs.accessSync(args.infile, fs.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      checkpoint(args, 'created %s', [args.infile]);
      // eslint-disable-next-line no-param-reassign
      args.outputUnreleased = true;
      writeFile(args, args.infile, '\n');
    }
  }
}

function outputChangelog(args, newVersion) {
  return new Promise((resolve, reject) => {
    createIfMissing(args);
    const { header } = args;

    let oldContent = args.dryRun ? '' : fs.readFileSync(args.infile, 'utf-8');
    const oldContentStart = oldContent.search(START_OF_LAST_RELEASE_PATTERN);
    // find the position of the last release and remove header:
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
      .on('error', (err) => reject(err));

    changelogStream.on('data', (buffer) => {
      content += buffer.toString();
    });

    changelogStream.on('end', () => {
      checkpoint(args, 'outputting changes to %s', [args.infile]);
      if (args.dryRun) console.info(`\n---\n${chalk.gray(content.trim())}\n---\n`);
      else {
        const trimmed = `${header}\n${(content + oldContent)}`.trimEnd();
        writeFile(args, args.infile, `${trimmed}\n`);
      }
      return resolve();
    });
  });
}

async function Changelog(args, newVersion) {
  if (args.skip.changelog) return;
  await runLifecycleScript(args, 'prechangelog');
  await outputChangelog(args, newVersion);
  await runLifecycleScript(args, 'postchangelog');
}

Changelog.START_OF_LAST_RELEASE_PATTERN = START_OF_LAST_RELEASE_PATTERN;

module.exports = Changelog;
