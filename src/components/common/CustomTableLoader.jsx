import React from "react";
import CustomButtonLoader from "./CustomButtonLoader";
export default function CustomTableLoader({ columnsCount }) {
  return (
    <tr>
      <td colSpan={columnsCount}>
        <center>
          <CustomButtonLoader loading={true} />
        </center>
      </td>
    </tr>
  );
}
