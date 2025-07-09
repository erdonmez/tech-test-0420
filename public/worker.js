const COLS = ['A', 'B', 'C', 'D'];

function parseToken(tok, raw) {
  const t = (tok || '').trim().toUpperCase();
  const m = t.match(/^([A-D])([1-9]\d*)$/);
  if (m) {
    const col = m[1], rowIdx = parseInt(m[2], 10) - 1;
    const val = raw[rowIdx]?.[col] || '';
    return Number(val) || 0;
  }
  return Number(t) || 0;
}

function evalFormula(formula, raw) {
  try {
    const expr = formula.slice(1); // drop '='
    const tokens = expr.split(/([+\-*])/);
    let acc = parseToken(tokens[0], raw);
    for (let i = 1; i < tokens.length; i += 2) {
      const op = tokens[i], next = parseToken(tokens[i + 1], raw);
      if (op === '+') acc += next;
      else if (op === '-') acc -= next;
      else if (op === '*') acc *= next;
    }
    return String(acc);
  } catch {
    return '#ERR';
  }
}

function computeAll(raw) {
  return raw.map(row =>
    COLS.reduce((acc, c) => {
      const val = row[c];
      acc[c] = (typeof val === 'string' && val.startsWith('='))
        ? evalFormula(val, raw)
        : val;
      return acc;
    }, {})
  );
}

self.onmessage = function (e) {
  const { rawData } = e.data;
  const result = computeAll(rawData);
  self.postMessage({ result });
};