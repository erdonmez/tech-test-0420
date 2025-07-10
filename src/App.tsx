import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import type {
  CellValueChangedEvent,
  ValueGetterParams,
  RowClassParams,
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const COLS = ['A', 'B', 'C', 'D'] as const;
const NUM_ROWS = 8;

type RowData = Record<string, string>;

interface CellRendererParams {
  value: string;
}

function makeEmptyRows() {
  return Array.from({ length: NUM_ROWS }, () =>
    COLS.reduce((acc, c) => ({ ...acc, [c]: '' }), {} as Record<string, string>)
  );
}

function App() {
  const [rawData, setRawData] = useState(() => {
    const saved = localStorage.getItem('jsonRawData');
    return saved ? JSON.parse(saved) : makeEmptyRows();
  });

  const [computedRows, setComputedRows] = useState(makeEmptyRows());
  const [flashedRow, setFlashedRow] = useState<number | null>(null);
  const [lastEditedRow, setLastEditedRow] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const FlashCell = React.memo((params: CellRendererParams) => (
    <span className="cell-content">{params.value}</span>
  ));

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

  useEffect(() => {
    if (lastEditedRow !== null) {
      const vals = computedRows[lastEditedRow] || {};
      const hasNegative = COLS.some((c) => Number(vals[c]) < 0);
      if (hasNegative) {
        setFlashedRow(lastEditedRow);
        const timer = setTimeout(() => setFlashedRow(null), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [computedRows, lastEditedRow]);

  const onCellValueChanged = useCallback((params: CellValueChangedEvent) => {
    const { rowIndex, colDef, newValue } = params;
    if (colDef.field && rowIndex !== null) {
      setLastEditedRow(rowIndex);
      setRawData((prev: RowData[]) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          [colDef.field!]: newValue,
        };
        workerRef.current?.postMessage({ rawData: updated });
        return updated;
      });
    }
  }, []);

  const getRowClass = (params: RowClassParams) =>
    flashedRow === params.node.rowIndex ? ['row-flash-neg'] : [];

  const columnDefs = COLS.map((col) => ({
    headerName: col,
    field: col,
    flex: 1,
    valueGetter: (params: ValueGetterParams) => {
      const rowIndex = params.node?.rowIndex;
      return rowIndex !== null && rowIndex !== undefined
        ? computedRows[rowIndex]?.[col] ?? ''
        : '';
    },
    cellRenderer: FlashCell,
  }));

  return (
    <div className="app-bg">
      <div className="spreadsheet-wrapper">
        <div className="sheet-title">Live Spreadsheet Demo</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0 12px 8px 0',
          }}
        >
          <button
            className="clear-btn"
            onClick={() => {
              setRawData(makeEmptyRows());
              setComputedRows(makeEmptyRows());
              localStorage.removeItem('jsonRawData');
            }}
          >
            Clear Data
          </button>
        </div>

        <div className="ag-theme-alpine spreadsheet-grid">
          <AgGridReact
            rowData={computedRows}
            columnDefs={columnDefs}
            defaultColDef={{
              editable: true,
              resizable: true,
              sortable: true,
              filter: false,
              flex: 1,
              minWidth: 80,
              cellClass: 'cell-content',
            }}
            onCellValueChanged={onCellValueChanged}
            getRowClass={getRowClass}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
