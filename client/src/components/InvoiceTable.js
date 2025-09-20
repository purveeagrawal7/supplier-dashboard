import React from 'react';

export default function InvoiceTable({ invoices }) {
  return (
    <table border="1" cellPadding="5" style={{ marginTop: 20 }}>
      <thead>
        <tr>
          <th>Supplier</th>
          <th>Amount</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv, idx) => (
          <tr key={idx}>
            <td>{inv.supplier}</td>
            <td>{inv.amount}</td>
            <td>{inv.invoice_date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
