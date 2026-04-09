const { inspectSnapshot, filterVars, formatInspect } = require('./inspect');
const { loadSnapshot } = require('./snapshot');

jest.mock('./snapshot');

const mockSnapshot = {
  createdAt: '2024-01-15T10:00:00.000Z',
  vars: {
    NODE_ENV: 'production',
    API_KEY: 'abc123',
    DB_PASSWORD: 'supersecret',
    PORT: '3000',
    APP_NAME: 'myapp',
  },
};

beforeEach(() => {
  loadSnapshot.mockReturnValue(mockSnapshot);
});

describe('inspectSnapshot', () => {
  it('returns structured inspect result', () => {
    const result = inspectSnapshot('prod', '/project');
    expect(result.name).toBe('prod');
    expect(result.keyCount).toBe(5);
    expect(result.vars).toEqual(mockSnapshot.vars);
    expect(result.createdAt).toBe(mockSnapshot.createdAt);
  });

  it('calls loadSnapshot with correct args', () => {
    inspectSnapshot('staging', '/my/project');
    expect(loadSnapshot).toHaveBeenCalledWith('staging', '/my/project');
  });
});

describe('filterVars', () => {
  const vars = { NODE_ENV: 'production', API_KEY: 'abc123', PORT: '3000' };

  it('returns all vars when no search term', () => {
    expect(filterVars(vars, null)).toEqual(vars);
  });

  it('filters by key substring', () => {
    const result = filterVars(vars, 'api');
    expect(Object.keys(result)).toEqual(['API_KEY']);
  });

  it('filters by value substring', () => {
    const result = filterVars(vars, 'production');
    expect(Object.keys(result)).toEqual(['NODE_ENV']);
  });

  it('returns empty object when no match', () => {
    expect(filterVars(vars, 'zzznomatch')).toEqual({});
  });
});

describe('formatInspect', () => {
  const inspectResult = {
    name: 'prod',
    createdAt: '2024-01-15T10:00:00.000Z',
    keyCount: 5,
    vars: mockSnapshot.vars,
  };

  it('includes snapshot name and key count', () => {
    const output = formatInspect(inspectResult);
    expect(output).toContain('Snapshot: prod');
    expect(output).toContain('Keys:     5');
  });

  it('masks password fields', () => {
    const output = formatInspect(inspectResult);
    expect(output).toContain('DB_PASSWORD');
    expect(output).toContain('********');
    expect(output).not.toContain('supersecret');
  });

  it('shows search match count when search provided', () => {
    const output = formatInspect(inspectResult, 'api');
    expect(output).toContain('matching "api"');
  });

  it('shows no matching keys message when filter yields nothing', () => {
    const output = formatInspect(inspectResult, 'zzznomatch');
    expect(output).toContain('(no matching keys)');
  });
});
