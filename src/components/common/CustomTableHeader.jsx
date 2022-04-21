import React from "react";

export default function CustomTableHeader({ tableColumns }) {
  return (
    <thead style={{ backgroundColor: "" }}>
      <tr>
        {tableColumns.map(({ title }, key) => (
          <th key={`head_list_${key}`}>{title}</th>
        ))}
      </tr>
    </thead>
  );
}
