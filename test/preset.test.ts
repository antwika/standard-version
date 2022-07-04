import shell from 'shelljs';
import fs from 'fs';
import command from '../src/command';
import standardVersion from '../src/index';

describe('preset', () => {
  beforeEach(() => {
    shell.rm('-rf', 'tmp');
    shell.config.silent = false;
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

  it('Conventional Commits (default)', async () => {
    const parsed = await command.getParser().parse('standard-version --silent');
    parsed.skip = { commit: true, tag: true };
    await standardVersion(parsed);
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
    expect(content).toMatch('### Features');
    expect(content).not.toMatch('### Performance Improvements');
    expect(content).not.toMatch('### Custom');
  });

  it('Angular', async () => {
    const parsed = await command.getParser().parse('standard-version --preset angular --silent');
    parsed.skip = { commit: true, tag: true };
    await standardVersion(parsed);
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8');
    expect(content).toMatch('### Features');
    expect(content).toMatch('### Performance Improvements');
    expect(content).not.toMatch('### Custom');
  });
});
