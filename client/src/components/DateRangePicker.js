import React, { useState } from 'react';

export default function DateRangePicker({ onSubmit }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  return (
    <div style={{ marginBottom: 20 }}>
      <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
      <input type="date" value={to} onChange={e => setTo(e.target.value)} />
      <button onClick={() => onSubmit(from, to)}>Fetch Data</button>
    </div>
  );
}
