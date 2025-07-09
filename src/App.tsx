import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const COLS = ['A', 'B', 'C', 'D'] as const;
const NUM_ROWS = 10;

function makeEmptyRows() {
  return Array.from({ length: NUM_ROWS }, () =>
    COLS.reduce((acc, c) => ({ ...acc, [c]: '' }), {} as Record<string, string>)
  );
}

function App() {
  const [rawData, setRawData] = useState(() => {
    const saved = localStorage.getItem('jsonRawData');
    return saved
      ? JSON.parse(saved)
      : Array.from({ length: NUM_ROWS }, () =>
          COLS.reduce(
            (acc, c) => ({ ...acc, [c]: '' }),
            {} as Record<string, string>
          )
        );
  });

  const [computedRows, setComputedRows] = useState(makeEmptyRows());
  const [flashedRow, setFlashedRow] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);

  const FlashCell = React.memo((params) => {
    const { value } = params;
    return <span className="cell-content">{value}</span>;
  });

  useEffect(() => {
    workerRef.current = new Worker('/worker.js');
    workerRef.current.onmessage = (e) => {
      setComputedRows(e.data.result);
    };
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

  useEffect(() => {
    if (flashedRow !== null) {
      const timer = setTimeout(() => setFlashedRow(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [flashedRow]);

  const onCellValueChanged = useCallback((params) => {
    const { rowIndex, colDef, newValue } = params;
    if (colDef.field) {
      setRawData((prev) => {
        const updated = [...prev];
        updated[rowIndex] = { ...updated[rowIndex], [colDef.field]: newValue };
        workerRef.current?.postMessage({ rawData: updated });
        setComputedRows((prev) => {
          const updatedComputed = [...prev];
          updatedComputed[rowIndex] = {
            ...updatedComputed[rowIndex],
            [colDef.field]: newValue,
          };
          return updatedComputed;
        });
        return updated;
      });

      if (
        typeof newValue === 'string' &&
        newValue.trim() &&
        Number(newValue) < 0
      ) {
        setFlashedRow(rowIndex);
      }
    }
  }, []);

  const getRowClass = (params) => {
    return flashedRow === params.node.rowIndex ? ['row-flash-neg'] : [];
  };

  const columnDefs = COLS.map((col) => ({
    headerName: col,
    field: col,
    flex: 1,
    valueGetter: (params) => computedRows[params.node.rowIndex]?.[col] ?? '',
    cellRenderer: FlashCell,
  }));

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="ag-theme-alpine"
        style={{
          height: 'calc(100vh - 40px)',
          width: 'calc(100vw - 40px)',
          maxWidth: '1200px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <AgGridReact
          rowData={computedRows}
          columnDefs={columnDefs}
          defaultColDef={{
            editable: true,
            resizable: true,
            sortable: true,
          }}
          onCellValueChanged={onCellValueChanged}
          getRowClass={getRowClass}
        />
      </div>
    </div>
  );
}

export default App;
