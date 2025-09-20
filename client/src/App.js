import React, { useState } from 'react';
import DateRangePicker from './components/DateRangePicker';
import InvoiceTable from './components/InvoiceTable';
import Charts from './components/Charts';
import Summary from './components/Summary';

function App() {
  const [data, setData] = useState({ invoices: [], summary: '' });

  const fetchSummary = async (from, to) => {
    const res = await fetch(`http://localhost:5000/api/summarize`);
    const json = await res.json();
    setData(json);
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>Supplier Dashboard</h1>
      <DateRangePicker onSubmit={fetchSummary} />
      <Charts invoices={data.invoices} />
      <InvoiceTable invoices={data.invoices} />
      <Summary text={data.summary} />
    </div>
  );
}

export default App;
