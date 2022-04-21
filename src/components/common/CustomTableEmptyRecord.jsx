import React from "react";
export default function CustomTableEmptyRecord({ columnsCount }) {
  return (
    <tr>
      <td colSpan={columnsCount}>
        <center>No Record Found!</center>
      </td>
    </tr>
  );
}
