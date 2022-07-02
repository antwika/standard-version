import shell from 'shelljs';
import fs from 'fs';
import chai from 'chai';
import cli from '../src/command';
import index from '../src/index';

chai.should();

function exec(opt?: any) {
  // const cli = require('../src/command');
  // eslint-disable-next-line no-param-reassign
  opt = cli.parse(`standard-version ${opt} --silent`);
  // eslint-disable-next-line no-param-reassign
  opt.skip = { commit: true, tag: true };
  return index(opt);
}

describe('presets', () => {
  beforeEach(() => {
    shell.rm('-rf', 'tmp');
    shell.config.silent = true;
    shell.mkdir('tmp');
    shell.cd('tmp');
    shell.exec('git init');
    shell.exec('git config commit.gpgSign false');
    shell.exec('git config core.autocrlf false');
    shell.exec('git commit --allow-empty -m "initial commit"');
    shell.exec('git commit --allow-empty -m "feat: A feature commit."');
    shell.exec('git commit --allow-empty -m "perf: A performance change."');
    shell.exec('git commit --allow-empty -m "chore: A chore commit."');
    shell.exec('git commit --allow-empty -m "ci: A ci commit."');
    shell.exec('git commit --allow-empty -m "custom: A custom commit."');
  });

  afterEach(() => {
    shell.cd('../');
    shell.rm('-rf', 'tmp');
  });

  // eslint-disable-next-line jest/expect-expect
  it('Conventional Commits (default)', async () => {
    await exec();
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
    content.should.contain('### Features');
    content.should.not.contain('### Performance Improvements');
    content.should.not.contain('### Custom');
  });

  // eslint-disable-next-line jest/expect-expect
  it('Angular', async () => {
    await exec('--preset angular');
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
    content.should.contain('### Features');
    content.should.contain('### Performance Improvements');
    content.should.not.contain('### Custom');
  });
});
