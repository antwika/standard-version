import formatCommitMessage from '../../src/format-commit-message';

describe('format-commit-message', () => {
  it('tests', () => {
    const formatted = formatCommitMessage('Test message {{currentTag}}', '1.2.3');
    expect(formatted).toBe('Test message 1.2.3');
  });
});
