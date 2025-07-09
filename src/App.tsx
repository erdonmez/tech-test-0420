import { useState, useCallback, useRef, useEffect } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const COLS = ['A', 'B', 'C', 'D'] as const;
const NUM_ROWS = 10;

function makeEmptyRows() {
  return Array.from({ length: NUM_ROWS }, () =>
    COLS.reduce((acc, c) => ({ ...acc, [c]: '' }), {} as Record<string, string>)
  );
}

const columnDefs = COLS.map(col => ({
  headerName: col,
  field: col,
  flex: 1
}));

function App() {
  const [rawData, setRawData] = useState(() => {
    const saved = localStorage.getItem('jsonRawData');
    return saved
      ? JSON.parse(saved)
      : Array.from({ length: NUM_ROWS }, () =>
        COLS.reduce((acc, c) => ({ ...acc, [c]: '' }), {} as Record<string, string>)
      );
  });
  const [computedRows, setComputedRows] = useState(makeEmptyRows());
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker('/worker.js');
    workerRef.current.onmessage = (e) => setComputedRows(e.data.result);
    workerRef.current.postMessage({ rawData });
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    localStorage.setItem('jsonRawData', JSON.stringify(rawData));
  }, [rawData]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'jsonRawData' && e.newValue) {
        const incoming = JSON.parse(e.newValue);
        setRawData(incoming);
        workerRef.current?.postMessage({ rawData: incoming });
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const onCellValueChanged = useCallback((params) => {
    const { rowIndex, colDef, newValue } = params;
    if (colDef.field) {
      setRawData(prev => {
        const updated = [...prev];
        updated[rowIndex] = { ...updated[rowIndex], [colDef.field]: newValue };
        workerRef.current?.postMessage({ rawData: updated });
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
