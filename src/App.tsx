import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

import { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const COLS = ['A', 'B', 'C', 'D'] as const;
const NUM_ROWS = 10;

function makeEmptyRows() {
  return Array.from({ length: NUM_ROWS }, () =>
    COLS.reduce((acc, c) => ({ ...acc, [c]: '' }), {} as Record<string, string>)
  );
}

function parseToken(tok: string, raw: Record<string, string>[]): number {
  const t = (tok || '').trim().toUpperCase();
  const m = t.match(/^([A-D])([1-9]\d*)$/);
  if (m) {
    const col = m[1], rowIdx = parseInt(m[2], 10) - 1;
    const val = raw[rowIdx]?.[col] || '';
    return Number(val) || 0;
  }
  return Number(t) || 0;
}

function evalFormula(formula: string, raw: Record<string, string>[]): string {
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

function computeAll(raw: Record<string, string>[]) {
  return raw.map(row =>
    COLS.reduce((acc, c) => {
      const val = row[c];
      acc[c] = (typeof val === 'string' && val.startsWith('='))
        ? evalFormula(val, raw)
        : val;
      return acc;
    }, {} as Record<string, string>)
  );
}

const columnDefs = COLS.map(col => ({
  headerName: col,
  field: col,
  flex: 1
}));

function App() {
  const [rawData, setRawData] = useState(makeEmptyRows());
  const computedRows = useMemo(() => computeAll(rawData), [rawData]);

  const onCellValueChanged = useCallback((params) => {
    const { rowIndex, colDef, newValue } = params;
    if (colDef.field) {
      setRawData(prev => {
        const updated = [...prev];
        updated[rowIndex] = { ...updated[rowIndex], [colDef.field]: newValue };
        return updated;
      });
    }
  }, []);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="ag-theme-alpine" style={{
        height: 'calc(100vh - 40px)',
        width: 'calc(100vw - 40px)',
        maxWidth: '1200px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <AgGridReact
          rowData={computedRows}
          columnDefs={columnDefs}
          defaultColDef={{
            editable: true,
            resizable: true,
            sortable: true
          }}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </div>
  );
}

export default App;
