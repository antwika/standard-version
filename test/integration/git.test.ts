import shell from 'shelljs';
import fs from 'fs';
import command from '../../src/command';
import standardVersion from '../../src/index';

describe('git', () => {
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

  it('will add prefix onto tag based on version from package.', async () => {
    jest.spyOn(global.console, 'info').mockImplementation();
    const pkg = { version: '1.2.0' };
    fs.writeFileSync('package.json', JSON.stringify(pkg), 'utf-8');
    const opts = await command.getParser().parse('--tag-prefix p-v');
    expect(opts.tagPrefix).toBe('p-v');
    await standardVersion(opts);
    expect(console.info).toHaveBeenCalledWith('[INFO] Run `git push --follow-tags origin main` to publish');
    expect(shell.exec('git tag -l').stdout).toMatch(/p-v1.3.0/);
  });

  it('can add prefix and bump the "major" version based on "git tag -l" when gitTagFallback is true and no version was found in package.', async () => {
    shell.exec('git tag android/production/v1.1.0');
    shell.exec('git tag android/production/v1.2.0');
    shell.exec('git commit --allow-empty -m "feat: a new feature"');
    shell.exec('git commit --allow-empty -m "feat!: a breaking change"');
    const opts = await command.getParser().parse('--tag-prefix android/production/v');
    await standardVersion(opts);
    expect(shell.exec('git tag -l').stdout).toMatch(/android\/production\/v2.0.0/);
  });

  it('can add prefix and bump the "minor" version based on "git tag -l" when gitTagFallback is true and no version was found in package.', async () => {
    shell.exec('git tag android/production/v1.1.0');
    shell.exec('git tag android/production/v1.2.0');
    shell.exec('git commit --allow-empty -m "feat: a new feature"');
    const opts = await command.getParser().parse('--tag-prefix android/production/v');
    await standardVersion(opts);
    expect(shell.exec('git tag -l').stdout).toMatch(/android\/production\/v1.3.0/);
  });

  it('can add prefix and bump the "patch" version based on "git tag -l" when gitTagFallback is true and no version was found in package.', async () => {
    shell.exec('git tag android/production/v1.1.0');
    shell.exec('git tag android/production/v1.2.0');
    shell.exec('git commit --allow-empty -m "fix: a fixed bug"');
    const opts = await command.getParser().parse('--tag-prefix android/production/v');
    await standardVersion(opts);
    expect(shell.exec('git tag -l').stdout).toMatch(/android\/production\/v1.2.1/);
  });

  it('formats the commit and tag messages appropriately', async () => {
    await standardVersion({});
    expect(shell.exec('git log --oneline -n1').stdout).toMatch(/chore\(release\): 1\.1\.0/);
    expect(shell.exec('git tag -l -n1 v1.1.0').stdout).toMatch(/chore\(release\): 1\.1\.0/);
  });

  it('formats the tag if --first-release is true', async () => {
    const pkg = { version: '1.0.1' };
    fs.writeFileSync('package.json', JSON.stringify(pkg), 'utf-8');
    const opts = await command.getParser().parse('--first-release');
    expect(opts.firstRelease).toBeTruthy();
    await standardVersion(opts);
    expect(shell.exec('git tag -l').stdout).toMatch(/1\.0\.1/);
  });

  it('commits all staged files', async () => {
    fs.writeFileSync('STUFF.md', 'stuff', 'utf-8');
    shell.exec('git add STUFF.md');
    const opts = await command.getParser().parse('--commit-all');
    await standardVersion(opts);
    expect(shell.exec('git status --porcelain').stdout).toBe('');
  });
});
