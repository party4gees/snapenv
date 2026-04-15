const { scoreSnapshot, formatScoreList } = require('./score');

describe('scoreSnapshot', () => {
  function makeMeta(daysAgo) {
    const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return { name: 'test', createdAt: d.toISOString() };
  }

  test('fresh snapshot with no extras scores on recency only', () => {
    const score = scoreSnapshot(makeMeta(0), [], false, false);
    expect(score).toBe(40);
  });

  test('old snapshot scores 0 for recency', () => {
    const score = scoreSnapshot(makeMeta(50), [], false, false);
    expect(score).toBe(0);
  });

  test('tags add 10 pts each up to 30', () => {
    const score = scoreSnapshot(makeMeta(50), ['a', 'b', 'c', 'd'], false, false);
    expect(score).toBe(30);
  });

  test('note adds 15 pts', () => {
    const score = scoreSnapshot(makeMeta(50), [], true, false);
    expect(score).toBe(15);
  });

  test('pinned adds 20 pts', () => {
    const score = scoreSnapshot(makeMeta(50), [], false, true);
    expect(score).toBe(20);
  });

  test('all signals combined', () => {
    const score = scoreSnapshot(makeMeta(0), ['x', 'y'], true, true);
    expect(score).toBe(40 + 20 + 15 + 20);
  });
});

describe('formatScoreList', () => {
  test('returns message when no snapshots', () => {
    expect(formatScoreList([])).toBe('No snapshots found.');
  });

  test('lists snapshots sorted by score', () => {
    const ranked = [
      { name: 'alpha', score: 55, pinned: true, hasNote: false, tags: [] },
      { name: 'beta', score: 20, pinned: false, hasNote: true, tags: ['env'] }
    ];
    const output = formatScoreList(ranked);
    expect(output).toContain('alpha');
    expect(output).toContain('55');
    expect(output).toContain('[pinned]');
    expect(output).toContain('beta');
    expect(output).toContain('[note]');
    expect(output).toContain('[tags: env]');
    const alphaIdx = output.indexOf('alpha');
    const betaIdx = output.indexOf('beta');
    expect(alphaIdx).toBeLessThan(betaIdx);
  });

  test('snapshot with no flags shows no brackets', () => {
    const ranked = [{ name: 'plain', score: 10, pinned: false, hasNote: false, tags: [] }];
    const output = formatScoreList(ranked);
    expect(output).not.toContain('[');
  });
});
