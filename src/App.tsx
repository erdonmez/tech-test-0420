import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { useState } from 'react';

const columnDefs = [
  { headerName: "A", field: "A" as const, flex: 1 },
  { headerName: "B", field: "B" as const, flex: 1 },
  { headerName: "C", field: "C" as const, flex: 1 },
  { headerName: "D", field: "D" as const, flex: 1 }
];

function App() {
  const [rowData, setRowData] = useState([
    { A: '', B: '', C: '', D: '' },
    { A: '', B: '', C: '', D: '' }
  ]);

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
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            editable: true,
            resizable: true,
            sortable: true
          }}
          onCellValueChanged={params => {
            const { rowIndex, colDef, newValue } = params;

            if (colDef.field) {
              setRowData(prev => {
                const updated = [...prev];
                updated[rowIndex] = { ...updated[rowIndex], [colDef.field]: newValue };
                return updated;
              });
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;