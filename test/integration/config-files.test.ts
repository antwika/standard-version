import shell from 'shelljs';
import fs from 'fs';
import command from '../../src/command';
import standardVersion from '../../src/index';

describe('config-files', () => {
  beforeEach(() => {
    shell.rm('-rf', 'tmp');
    shell.mkdir('tmp');
    shell.cd('tmp');
    shell.exec('git init');
    shell.exec('git commit --allow-empty -m "feat: initial"');
  });

  afterEach(() => {
    shell.cd('../');
    shell.rm('-rf', 'tmp');
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('reads config from package.json', async () => {
    const issueUrlFormat = 'https://standard-version.company.net/browse/{{id}}';
    const pkg = {
      version: '1.0.0',
      repository: { url: 'git+https://company@scm.org/office/app.git' },
      'standard-version': {
        issueUrlFormat,
        types: [
          { type: 'feat', section: 'Features' },
          { type: 'fix', section: 'Bug Fixes' },
          { type: 'test', section: 'Tests', hidden: false },
        ],
      },
    };
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf-8');
    shell.exec('git add package.json');
    shell.exec('git commit -m "feat: add package.json"');
    shell.exec('git commit --allow-empty -m "test: example test commit"');
    const opt = await command.getParser().parse('standard-version');
    opt.skip = { commit: true, tag: true };
    expect(opt).toBeDefined();
    await standardVersion(opt);

    const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
    // expect(content).toMatch(issueUrlFormat);
    expect(content).toMatch('### Tests');
    expect(content).toMatch('* example test commit');
  });

  it.each([
    ['.versionrc'],
    ['.versionrc.json'],
  ])(
    'reads config from %p.',
    async (filename) => {
      shell.exec('git commit --allow-empty -m "test: example test commit"');
      const issueUrlFormat = 'http://www.foo.com/{{id}}';
      fs.writeFileSync(filename, JSON.stringify({
        issueUrlFormat,
        types: [
          { type: 'feat', section: 'Features' },
          { type: 'fix', section: 'Bug Fixes' },
          { type: 'test', section: 'Tests', hidden: false },
        ],
      }, null, 2), 'utf-8');

      const opt = await command.getParser().parse('standard-version');
      opt.skip = { commit: true, tag: true };
      await standardVersion(opt);
      const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
      // expect(content).toMatch(issueUrlFormat);
      expect(content).toMatch('### Tests');
      expect(content).toMatch('* example test commit');
    },
  );

  it('evaluates a config-function from .versionrc.js', async () => {
    shell.exec('git commit --allow-empty -m "test: example test commit"');
    const issueUrlFormat = 'http://www.foo.com/{{id}}';
    const src = `module.exports = function() { return ${JSON.stringify({
      issueUrlFormat,
      types: [
        { type: 'feat', section: 'Features' },
        { type: 'fix', section: 'Bug Fixes' },
        { type: 'test', section: 'Tests', hidden: false },
      ],
    })} }`;
    fs.writeFileSync('.versionrc.js', src, 'utf-8');

    const opt = await command.getParser().parse('standard-version');
    opt.skip = { commit: true, tag: true };
    await standardVersion(opt);
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
    // expect(content).toMatch(issueUrlFormat);
    expect(content).toMatch('### Tests');
    expect(content).toMatch('* example test commit');
  });

  it('evaluates a config-object from .versionrc.js', async () => {
    shell.exec('git commit --allow-empty -m "test: example test commit"');
    const issueUrlFormat = 'http://www.foo.com/{{id}}';
    const src = `module.exports = ${JSON.stringify({
      issueUrlFormat,
      types: [
        { type: 'feat', section: 'Features' },
        { type: 'fix', section: 'Bug Fixes' },
        { type: 'test', section: 'Tests', hidden: false },
      ],
    })}`;
    fs.writeFileSync('.versionrc.js', src, 'utf-8');

    const opt = await command.getParser().parse('standard-version');
    opt.skip = { commit: true, tag: true };
    await standardVersion(opt);
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
    // expect(content).toMatch(issueUrlFormat);
    expect(content).toMatch('### Tests');
    expect(content).toMatch('* example test commit');
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('throws an error when a non-object nor function is returned from .versionrc.js', async () => {
    shell.exec('git commit --allow-empty -m "test: example test commit"');
    fs.writeFileSync('.versionrc.js', 'module.exports = 3', 'utf-8');
    await expect(async () => command.getParser().parse('standard-version')).rejects.toThrowError();
  });
});
