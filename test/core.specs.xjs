const shell = require('shelljs');
const fs = require('fs');
const { resolve } = require('path');
const { Readable } = require('stream');
const mockFS = require('mock-fs');
const mockery = require('mockery');
const stdMocks = require('std-mocks');

const cli = require('../src/command');
const formatCommitMessage = require('../src/format-commit-message');

require('chai').should();

// set by mock()
let standardVersion;

// eslint-disable-next-line default-param-last
function exec(opt = '', git) {
  if (typeof opt === 'string') {
    // eslint-disable-next-line no-param-reassign
    opt = cli.parse(`standard-version ${opt}`);
  }
  // eslint-disable-next-line no-param-reassign
  if (!git) opt.skip = { ...opt.skip, commit: true, tag: true };
  return standardVersion(opt);
}

function getPackageVersion() {
  return JSON.parse(fs.readFileSync('package.json', 'utf-8')).version;
}

/**
 * Mock external conventional-changelog modules
 *
 * Mocks should be unregistered in test cleanup by calling unmock()
 *
 * bump?: 'major' | 'minor' | 'patch' | Error | (opt, cb) => { cb(err) | cb(null, { releaseType }) }
 * changelog?: string | Error | Array<string | Error | (opt) => string | null>
 * execFile?: ({ dryRun, silent }, cmd, cmdArgs) => Promise<string>
 * fs?: { [string]: string | Buffer | any }
 * pkg?: { [string]: any }
 * tags?: string[] | Error
 */
function mock({
  bump,
  changelog,
  execFile,
  // eslint-disable-next-line no-shadow
  fs,
  pkg,
  tags,
} = {}) {
  mockery.enable({ warnOnUnregistered: false, useCleanCache: true });

  mockery.registerMock('conventional-recommended-bump', (opt, cb) => {
    if (typeof bump === 'function') bump(opt, cb);
    else if (bump instanceof Error) cb(bump);
    else cb(null, bump ? { releaseType: bump } : {});
  });

  // eslint-disable-next-line no-param-reassign
  if (!Array.isArray(changelog)) changelog = [changelog];
  mockery.registerMock(
    'conventional-changelog',
    (opt) => new Readable({
      read(/* _size */) {
        const next = changelog.shift();
        if (next instanceof Error) {
          this.destroy(next);
        } else if (typeof next === 'function') {
          this.push(next(opt));
        } else {
          this.push(next ? Buffer.from(next, 'utf8') : null);
        }
      },
    }),
  );

  mockery.registerMock('git-semver-tags', (cb) => {
    if (tags instanceof Error) cb(tags);
    else cb(null, tags || []);
  });

  if (typeof execFile === 'function') {
    // called from commit & tag lifecycle methods
    mockery.registerMock('../run-execFile', execFile);
  }

  // needs to be set after mockery, but before mock-fs
  standardVersion = require('../src/index');

  // eslint-disable-next-line no-param-reassign
  fs = { ...fs };
  if (pkg) {
    // eslint-disable-next-line no-param-reassign
    fs['package.json'] = JSON.stringify(pkg);
  } else if (pkg === undefined && !fs['package.json']) {
    // eslint-disable-next-line no-param-reassign
    fs['package.json'] = JSON.stringify({ version: '1.0.0' });
  }
  mockFS(fs);

  stdMocks.use();
  return () => stdMocks.flush();
}

function unmock() {
  mockery.deregisterAll();
  mockery.disable();
  mockFS.restore();
  stdMocks.restore();
  standardVersion = null;

  // push out prints from the Mocha reporter
  const { stdout } = stdMocks.flush();
  for (const str of stdout) {
    if (str.startsWith(' ')) process.stdout.write(str);
  }
}

describe('format-commit-message', () => {
  // eslint-disable-next-line jest/expect-expect
  it('works for no {{currentTag}}', () => {
    formatCommitMessage('chore(release): 1.0.0', '1.0.0').should.equal(
      'chore(release): 1.0.0',
    );
  });
  // eslint-disable-next-line jest/expect-expect
  it('works for one {{currentTag}}', () => {
    formatCommitMessage('chore(release): {{currentTag}}', '1.0.0').should.equal(
      'chore(release): 1.0.0',
    );
  });
  // eslint-disable-next-line jest/expect-expect
  it('works for two {{currentTag}}', () => {
    formatCommitMessage(
      'chore(release): {{currentTag}} \n\n* CHANGELOG: https://github.com/conventional-changelog/standard-version/blob/v{{currentTag}}/CHANGELOG.md',
      '1.0.0',
    ).should.equal(
      'chore(release): 1.0.0 \n\n* CHANGELOG: https://github.com/conventional-changelog/standard-version/blob/v1.0.0/CHANGELOG.md',
    );
  });
});

describe('cli', () => {
  afterEach(unmock);

  describe('CHANGELOG.md does not exist', () => {
    // eslint-disable-next-line jest/expect-expect
    it('populates changelog with commits since last tag by default', async () => {
      mock({ bump: 'patch', changelog: 'patch release\n', tags: ['v1.0.0'] });
      await exec();
      const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.match(/patch release/);
    });

    // eslint-disable-next-line jest/expect-expect
    it('includes all commits if --first-release is true', async () => {
      mock({
        bump: 'minor',
        changelog: 'first commit\npatch release\n',
        pkg: { version: '1.0.1' },
      });
      await exec('--first-release');
      const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.match(/patch release/);
      content.should.match(/first commit/);
    });

    // eslint-disable-next-line jest/expect-expect
    it('skipping changelog will not create a changelog file', async () => {
      mock({ bump: 'minor', changelog: 'foo\n' });
      await exec('--skip.changelog true');
      getPackageVersion().should.equal('1.1.0');
      try {
        fs.readFileSync('CHANGELOG.md', 'utf-8');
        throw new Error('File should not exist');
      } catch (err) {
        err.code.should.equal('ENOENT');
      }
    });
  });

  describe('CHANGELOG.md exists', () => {
    // eslint-disable-next-line jest/expect-expect
    it('appends the new release above the last release, removing the old header (legacy format)', async () => {
      mock({
        bump: 'patch',
        changelog: 'release 1.0.1\n',
        fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
        tags: ['v1.0.0'],
      });
      await exec();
      const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.match(/1\.0\.1/);
      content.should.not.match(/legacy header format/);
    });

    // eslint-disable-next-line jest/expect-expect
    it('appends the new release above the last release, removing the old header (new format)', async () => {
      const { header } = require('../src/defaults');
      const changelog1 = '### [1.0.1](/compare/v1.0.0...v1.0.1) (YYYY-MM-DD)\n\n\n### Bug Fixes\n\n* patch release ABCDEFXY\n';
      mock({ bump: 'patch', changelog: changelog1, tags: ['v1.0.0'] });
      await exec();
      let content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.equal(`${header}\n${changelog1}`);

      const changelog2 = '### [1.0.2](/compare/v1.0.1...v1.0.2) (YYYY-MM-DD)\n\n\n### Bug Fixes\n\n* another patch release ABCDEFXY\n';
      unmock();
      mock({
        bump: 'patch',
        changelog: changelog2,
        fs: { 'CHANGELOG.md': content },
        tags: ['v1.0.0', 'v1.0.1'],
      });
      await exec();
      content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.equal(`${header}\n${changelog2}${changelog1}`);
    });

    // eslint-disable-next-line jest/expect-expect
    it('[DEPRECATED] (--changelogHeader) allows for a custom changelog header', async () => {
      const header = '# Pork Chop Log';
      mock({
        bump: 'minor',
        changelog: `${header}\n`,
        fs: { 'CHANGELOG.md': '' },
      });
      await exec(`--changelogHeader="${header}"`);
      const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.match(new RegExp(header));
    });

    // eslint-disable-next-line jest/expect-expect
    it('[DEPRECATED] (--changelogHeader) exits with error if changelog header matches last version search regex', async () => {
      mock({ bump: 'minor', fs: { 'CHANGELOG.md': '' } });
      try {
        await exec('--changelogHeader="## 3.0.2"');
        throw new Error('That should not have worked');
      } catch (error) {
        error.message.should.match(/custom changelog header must not match/);
      }
    });
  });

  describe('lifecycle scripts', () => {
    describe('prerelease hook', () => {
      // eslint-disable-next-line jest/expect-expect
      it('should run the prerelease hook when provided', async () => {
        const flush = mock({
          bump: 'minor',
          fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
        });

        await exec({
          scripts: { prerelease: 'node -e "console.error(\'prerelease\' + \' ran\')"' },
        });
        const { stderr } = flush();
        stderr.join('\n').should.match(/prerelease ran/);
      });

      // eslint-disable-next-line jest/expect-expect
      it('should abort if the hook returns a non-zero exit code', async () => {
        mock({
          bump: 'minor',
          fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
        });

        try {
          await exec({
            scripts: {
              prerelease: 'node -e "throw new Error(\'prerelease\' + \' fail\')"',
            },
          });
          /* istanbul ignore next */
          throw new Error('Unexpected success');
        } catch (error) {
          error.message.should.match(/prerelease fail/);
        }
      });
    });

    describe('prebump hook', () => {
      // eslint-disable-next-line jest/expect-expect
      it('should allow prebump hook to return an alternate version #', async () => {
        const flush = mock({
          bump: 'minor',
          fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
        });

        await exec({ scripts: { prebump: 'node -e "console.log(Array.of(9, 9, 9).join(\'.\'))"' } });
        const { stdout } = flush();
        stdout.join('').should.match(/9\.9\.9/);
      });
    });

    describe('postbump hook', () => {
      // eslint-disable-next-line jest/expect-expect
      it('should run the postbump hook when provided', async () => {
        const flush = mock({
          bump: 'minor',
          fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
        });

        await exec({
          scripts: { postbump: 'node -e "console.error(\'postbump\' + \' ran\')"' },
        });
        const { stderr } = flush();
        stderr.join('\n').should.match(/postbump ran/);
      });

      // eslint-disable-next-line jest/expect-expect
      it('should run the postbump and exit with error when postbump fails', async () => {
        mock({
          bump: 'minor',
          fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
        });

        try {
          await exec({
            scripts: { postbump: 'node -e "throw new Error(\'postbump\' + \' fail\')"' },
          });
          await exec('--patch');
          /* istanbul ignore next */
          throw new Error('Unexpected success');
        } catch (error) {
          error.message.should.match(/postbump fail/);
        }
      });
    });
  });

  describe('manual-release', () => {
    describe('release-types', () => {
      const regularTypes = ['major', 'minor', 'patch'];
      const nextVersion = { major: '2.0.0', minor: '1.1.0', patch: '1.0.1' };

      regularTypes.forEach((type) => {
        // eslint-disable-next-line jest/expect-expect
        it(`creates a ${type} release`, async () => {
          mock({
            bump: 'patch',
            fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
          });
          await exec(`--release-as ${type}`);
          getPackageVersion().should.equal(nextVersion[type]);
        });
      });

      // this is for pre-releases
      regularTypes.forEach((type) => {
        // eslint-disable-next-line jest/expect-expect
        it(`creates a pre${type} release`, async () => {
          mock({
            bump: 'patch',
            fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
          });
          await exec(`--release-as ${type} --prerelease ${type}`);
          getPackageVersion().should.equal(`${nextVersion[type]}-${type}.0`);
        });
      });
    });

    describe('release-as-exact', () => {
      // eslint-disable-next-line jest/expect-expect
      it('releases as v100.0.0', async () => {
        mock({
          bump: 'patch',
          fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
        });
        await exec('--release-as v100.0.0');
        getPackageVersion().should.equal('100.0.0');
      });

      // eslint-disable-next-line jest/expect-expect
      it('releases as 200.0.0-amazing', async () => {
        mock({
          bump: 'patch',
          fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
        });
        await exec('--release-as 200.0.0-amazing');
        getPackageVersion().should.equal('200.0.0-amazing');
      });
    });

    // eslint-disable-next-line jest/expect-expect
    it('creates a prerelease with a new minor version after two prerelease patches', async () => {
      let releaseType = 'patch';
      const bump = (_, cb) => cb(null, { releaseType });
      mock({
        bump,
        fs: { 'CHANGELOG.md': 'legacy header format<a name="1.0.0">\n' },
      });

      await exec('--release-as patch --prerelease dev');
      getPackageVersion().should.equal('1.0.1-dev.0');

      await exec('--prerelease dev');
      getPackageVersion().should.equal('1.0.1-dev.1');

      releaseType = 'minor';
      await exec('--release-as minor --prerelease dev');
      getPackageVersion().should.equal('1.1.0-dev.0');

      await exec('--release-as minor --prerelease dev');
      getPackageVersion().should.equal('1.1.0-dev.1');

      await exec('--prerelease dev');
      getPackageVersion().should.equal('1.1.0-dev.2');
    });
  });

  // eslint-disable-next-line jest/expect-expect
  it('appends line feed at end of package.json', async () => {
    mock({ bump: 'patch' });
    await exec();
    const pkgJson = fs.readFileSync('package.json', 'utf-8');
    pkgJson.should.equal('{\n  "version": "1.0.1"\n}\n');
  });

  // eslint-disable-next-line jest/expect-expect
  it('preserves indentation of tabs in package.json', async () => {
    mock({
      bump: 'patch',
      fs: { 'package.json': '{\n\t"version": "1.0.0"\n}\n' },
    });
    await exec();
    const pkgJson = fs.readFileSync('package.json', 'utf-8');
    pkgJson.should.equal('{\n\t"version": "1.0.1"\n}\n');
  });

  // eslint-disable-next-line jest/expect-expect
  it('preserves indentation of spaces in package.json', async () => {
    mock({
      bump: 'patch',
      fs: { 'package.json': '{\n    "version": "1.0.0"\n}\n' },
    });
    await exec();
    const pkgJson = fs.readFileSync('package.json', 'utf-8');
    pkgJson.should.equal('{\n    "version": "1.0.1"\n}\n');
  });

  // eslint-disable-next-line jest/expect-expect
  it('preserves carriage return + line feed in package.json', async () => {
    mock({
      bump: 'patch',
      fs: { 'package.json': '{\r\n  "version": "1.0.0"\r\n}\r\n' },
    });
    await exec();
    const pkgJson = fs.readFileSync('package.json', 'utf-8');
    pkgJson.should.equal('{\r\n  "version": "1.0.1"\r\n}\r\n');
  });

  // eslint-disable-next-line jest/expect-expect
  it('does not print output when the --silent flag is passed', async () => {
    const flush = mock();
    await exec('--silent');
    flush().should.eql({ stdout: [], stderr: [] });
  });
});

describe('standard-version', () => {
  afterEach(unmock);

  // eslint-disable-next-line jest/expect-expect
  it('should exit on bump error', async () => {
    mock({ bump: new Error('bump err') });
    try {
      await exec();
      /* istanbul ignore next */
      throw new Error('Unexpected success');
    } catch (err) {
      err.message.should.match(/bump err/);
    }
  });

  // eslint-disable-next-line jest/expect-expect
  it('should exit on changelog error', async () => {
    mock({ bump: 'minor', changelog: new Error('changelog err') });
    try {
      await exec();
      /* istanbul ignore next */
      throw new Error('Unexpected success');
    } catch (err) {
      err.message.should.match(/changelog err/);
    }
  });

  // eslint-disable-next-line jest/expect-expect
  it('should exit with error without a package file to bump', async () => {
    mock({ bump: 'patch', pkg: false });
    try {
      await exec({ gitTagFallback: false });
      /* istanbul ignore next */
      throw new Error('Unexpected success');
    } catch (err) {
      err.message.should.equal('no package file found');
    }
  });

  // eslint-disable-next-line jest/expect-expect
  it('bumps version # in bower.json', async () => {
    mock({
      bump: 'minor',
      fs: { 'bower.json': JSON.stringify({ version: '1.0.0' }) },
      tags: ['v1.0.0'],
    });
    await exec();
    JSON.parse(fs.readFileSync('bower.json', 'utf-8')).version.should.equal(
      '1.1.0',
    );
    getPackageVersion().should.equal('1.1.0');
  });

  // eslint-disable-next-line jest/expect-expect
  it('bumps version # in manifest.json', async () => {
    mock({
      bump: 'minor',
      fs: { 'manifest.json': JSON.stringify({ version: '1.0.0' }) },
      tags: ['v1.0.0'],
    });
    await exec();
    JSON.parse(fs.readFileSync('manifest.json', 'utf-8')).version.should.equal(
      '1.1.0',
    );
    getPackageVersion().should.equal('1.1.0');
  });

  describe('custom `bumpFiles` support', () => {
    // eslint-disable-next-line jest/expect-expect
    it('mix.exs + version.txt', async () => {
      const updater = 'custom-updater.js';
      const updaterModule = require('./mocks/updater/customer-updater');
      mock({
        bump: 'minor',
        fs: {
          'mix.exs': fs.readFileSync('./test/mocks/mix.exs'),
          'version.txt': fs.readFileSync('./test/mocks/version.txt'),
        },
        tags: ['v1.0.0'],
      });
      mockery.registerMock(resolve(process.cwd(), updater), updaterModule);

      await exec({
        bumpFiles: [
          'version.txt',
          { filename: 'mix.exs', updater: 'custom-updater.js' },
        ],
      });
      fs.readFileSync('mix.exs', 'utf-8').should.contain('version: "1.1.0"');
      fs.readFileSync('version.txt', 'utf-8').should.equal('1.1.0');
    });

    // eslint-disable-next-line jest/expect-expect
    it('bumps a custom `plain-text` file', async () => {
      mock({
        bump: 'minor',
        fs: {
          'VERSION_TRACKER.txt': fs.readFileSync(
            './test/mocks/VERSION-1.0.0.txt',
          ),
        },
      });
      await exec({
        bumpFiles: [{ filename: 'VERSION_TRACKER.txt', type: 'plain-text' }],
      });
      fs.readFileSync('VERSION_TRACKER.txt', 'utf-8').should.equal('1.1.0');
    });
  });

  describe('custom `packageFiles` support', () => {
    // eslint-disable-next-line jest/expect-expect
    it('reads and writes to a custom `plain-text` file', async () => {
      mock({
        bump: 'minor',
        fs: {
          'VERSION_TRACKER.txt': fs.readFileSync(
            './test/mocks/VERSION-6.3.1.txt',
          ),
        },
      });
      await exec({
        packageFiles: [{ filename: 'VERSION_TRACKER.txt', type: 'plain-text' }],
        bumpFiles: [{ filename: 'VERSION_TRACKER.txt', type: 'plain-text' }],
      });
      fs.readFileSync('VERSION_TRACKER.txt', 'utf-8').should.equal('6.4.0');
    });

    // eslint-disable-next-line jest/expect-expect
    it('allows same object to be used in packageFiles and bumpFiles', async () => {
      mock({
        bump: 'minor',
        fs: {
          'VERSION_TRACKER.txt': fs.readFileSync(
            './test/mocks/VERSION-6.3.1.txt',
          ),
        },
      });
      const origWarn = console.warn;
      console.warn = () => {
        throw new Error('console.warn should not be called');
      };
      const filedesc = { filename: 'VERSION_TRACKER.txt', type: 'plain-text' };
      try {
        await exec({ packageFiles: [filedesc], bumpFiles: [filedesc] });
        fs.readFileSync('VERSION_TRACKER.txt', 'utf-8').should.equal('6.4.0');
      } finally {
        console.warn = origWarn;
      }
    });
  });

  // eslint-disable-next-line jest/expect-expect
  it('`packageFiles` are bumped along with `bumpFiles` defaults [standard-version#533]', async () => {
    mock({
      bump: 'minor',
      fs: {
        '.gitignore': '',
        'package-lock.json': JSON.stringify({ version: '1.0.0' }),
        'manifest.json': fs.readFileSync('./test/mocks/manifest-6.3.1.json'),
      },
      tags: ['v1.0.0'],
    });

    await exec({
      silent: true,
      packageFiles: [
        {
          filename: 'manifest.json',
          type: 'json',
        },
      ],
    });

    JSON.parse(fs.readFileSync('manifest.json', 'utf-8')).version.should.equal('6.4.0');
    JSON.parse(fs.readFileSync('package.json', 'utf-8')).version.should.equal('6.4.0');
    JSON.parse(fs.readFileSync('package-lock.json', 'utf-8')).version.should.equal('6.4.0');
  });

  // eslint-disable-next-line jest/expect-expect
  it('bumps version # in npm-shrinkwrap.json', async () => {
    mock({
      bump: 'minor',
      fs: {
        'npm-shrinkwrap.json': JSON.stringify({ version: '1.0.0' }),
      },
      tags: ['v1.0.0'],
    });
    await exec();
    JSON.parse(
      fs.readFileSync('npm-shrinkwrap.json', 'utf-8'),
    ).version.should.equal('1.1.0');
    getPackageVersion().should.equal('1.1.0');
  });

  // eslint-disable-next-line jest/expect-expect
  it('bumps version # in package-lock.json', async () => {
    mock({
      bump: 'minor',
      fs: {
        '.gitignore': '',
        'package-lock.json': JSON.stringify({ version: '1.0.0' }),
      },
      tags: ['v1.0.0'],
    });
    await exec();
    JSON.parse(
      fs.readFileSync('package-lock.json', 'utf-8'),
    ).version.should.equal('1.1.0');
    getPackageVersion().should.equal('1.1.0');
  });

  describe('skip', () => {
    // eslint-disable-next-line jest/expect-expect
    it('allows bump and changelog generation to be skipped', async () => {
      const changelogContent = 'legacy header format<a name="1.0.0">\n';
      mock({
        bump: 'minor',
        changelog: 'foo\n',
        fs: { 'CHANGELOG.md': changelogContent },
      });

      await exec('--skip.bump true --skip.changelog true');
      getPackageVersion().should.equal('1.0.0');
      const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.equal(changelogContent);
    });
  });

  // eslint-disable-next-line jest/expect-expect
  it('does not update files present in .gitignore', async () => {
    mock({
      bump: 'minor',
      fs: {
        '.gitignore': 'package-lock.json\nbower.json',
        // test a defaults.packageFiles
        'bower.json': JSON.stringify({ version: '1.0.0' }),
        // test a defaults.bumpFiles
        'package-lock.json': JSON.stringify({
          name: '@org/package',
          version: '1.0.0',
          lockfileVersion: 1,
        }),
      },
      tags: ['v1.0.0'],
    });
    await exec();
    JSON.parse(fs.readFileSync('package-lock.json', 'utf-8')).version.should.equal(
      '1.0.0',
    );
    JSON.parse(fs.readFileSync('bower.json', 'utf-8')).version.should.equal(
      '1.0.0',
    );
    getPackageVersion().should.equal('1.1.0');
  });

  describe('configuration', () => {
    // eslint-disable-next-line jest/expect-expect
    it('--header', async () => {
      mock({ bump: 'minor', fs: { 'CHANGELOG.md': '' } });
      await exec('--header="# Welcome to our CHANGELOG.md"');
      const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.match(/# Welcome to our CHANGELOG.md/);
    });

    // eslint-disable-next-line jest/expect-expect
    it('--issuePrefixes and --issueUrlFormat', async () => {
      const format = 'http://www.foo.com/{{prefix}}{{id}}';
      const prefix = 'ABC-';
      const changelog = ({ preset }) => `${preset.issueUrlFormat}:${preset.issuePrefixes}`;
      mock({ bump: 'minor', changelog });
      await exec(`--issuePrefixes="${prefix}" --issueUrlFormat="${format}"`);
      const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      content.should.include(`${format}:${prefix}`);
    });
  });

  describe('pre-major', () => {
    // eslint-disable-next-line jest/expect-expect
    it('bumps the minor rather than major, if version < 1.0.0', async () => {
      mock({
        bump: 'minor',
        pkg: {
          version: '0.5.0',
          repository: { url: 'https://github.com/yargs/yargs.git' },
        },
      });
      await exec();
      getPackageVersion().should.equal('0.6.0');
    });

    // eslint-disable-next-line jest/expect-expect
    it('bumps major if --release-as=major specified, if version < 1.0.0', async () => {
      mock({
        bump: 'major',
        pkg: {
          version: '0.5.0',
          repository: { url: 'https://github.com/yargs/yargs.git' },
        },
      });
      await exec('-r major');
      getPackageVersion().should.equal('1.0.0');
    });
  });
});

describe('GHSL-2020-111', () => {
  afterEach(unmock);

  // eslint-disable-next-line jest/expect-expect
  it('does not allow command injection via basic configuration', async () => {
    mock({ bump: 'patch' });
    await exec({
      noVerify: true,
      infile: 'foo.txt',
      releaseCommitMessageFormat: 'bla `touch exploit`',
    });
    const stat = shell.test('-f', './exploit');
    stat.should.equal(false);
  });
});

describe('with mocked git', () => {
  afterEach(unmock);

  // eslint-disable-next-line jest/expect-expect
  it('--sign signs the commit and tag', async () => {
    const gitArgs = [
      ['add', 'CHANGELOG.md', 'package.json'],
      ['commit', '-S', 'CHANGELOG.md', 'package.json', '-m', 'chore(release): 1.0.1'],
      ['tag', '-s', 'v1.0.1', '-m', 'chore(release): 1.0.1'],
      ['rev-parse', '--abbrev-ref', 'HEAD'],
    ];
    const execFile = (_args, cmd, cmdArgs) => {
      cmd.should.equal('git');
      const expected = gitArgs.shift();
      cmdArgs.should.deep.equal(expected);
      if (expected[0] === 'rev-parse') return Promise.resolve('master');
      return Promise.resolve('');
    };
    mock({ bump: 'patch', changelog: 'foo\n', execFile });

    await exec('--sign', true);
    gitArgs.should.have.lengthOf(0);
  });

  // eslint-disable-next-line jest/expect-expect
  it('fails if git add fails', async () => {
    const gitArgs = [
      ['add', 'CHANGELOG.md', 'package.json'],
    ];
    const execFile = (_args, cmd, cmdArgs) => {
      cmd.should.equal('git');
      const expected = gitArgs.shift();
      cmdArgs.should.deep.equal(expected);
      if (expected[0] === 'add') {
        return Promise.reject(new Error('Command failed: git\nfailed add'));
      }
      return Promise.resolve('');
    };
    mock({ bump: 'patch', changelog: 'foo\n', execFile });

    try {
      await exec({}, true);
      /* istanbul ignore next */
      throw new Error('Unexpected success');
    } catch (error) {
      error.message.should.match(/failed add/);
    }
  });

  // eslint-disable-next-line jest/expect-expect
  it('fails if git commit fails', async () => {
    const gitArgs = [
      ['add', 'CHANGELOG.md', 'package.json'],
      ['commit', 'CHANGELOG.md', 'package.json', '-m', 'chore(release): 1.0.1'],
    ];
    const execFile = (_args, cmd, cmdArgs) => {
      cmd.should.equal('git');
      const expected = gitArgs.shift();
      cmdArgs.should.deep.equal(expected);
      if (expected[0] === 'commit') {
        return Promise.reject(new Error('Command failed: git\nfailed commit'));
      }
      return Promise.resolve('');
    };
    mock({ bump: 'patch', changelog: 'foo\n', execFile });

    try {
      await exec({}, true);
      /* istanbul ignore next */
      throw new Error('Unexpected success');
    } catch (error) {
      error.message.should.match(/failed commit/);
    }
  });

  // eslint-disable-next-line jest/expect-expect
  it('fails if git tag fails', async () => {
    const gitArgs = [
      ['add', 'CHANGELOG.md', 'package.json'],
      ['commit', 'CHANGELOG.md', 'package.json', '-m', 'chore(release): 1.0.1'],
      ['tag', '-a', 'v1.0.1', '-m', 'chore(release): 1.0.1'],
    ];
    const execFile = (_args, cmd, cmdArgs) => {
      cmd.should.equal('git');
      const expected = gitArgs.shift();
      cmdArgs.should.deep.equal(expected);
      if (expected[0] === 'tag') {
        return Promise.reject(new Error('Command failed: git\nfailed tag'));
      }
      return Promise.resolve('');
    };
    mock({ bump: 'patch', changelog: 'foo\n', execFile });

    try {
      await exec({}, true);
      /* istanbul ignore next */
      throw new Error('Unexpected success');
    } catch (error) {
      error.message.should.match(/failed tag/);
    }
  });
});
