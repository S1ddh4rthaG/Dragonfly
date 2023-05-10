import React from "react";

export default function Memory(props) {
  const memTable = props.MEM.MEM_DISPLAY();
  let output = React.Children.toArray(
    memTable.map((segment, idx) => {
      return (
        <tr>
          <td>0x{props.MEM.toHEX(idx * 16, 4)}</td>
          {React.Children.toArray(
            segment.map((memVal) => {
              return <td>{memVal}</td>;
            })
          )}
          {React.Children.toArray(
            segment.map((memVal) => {
              const val = parseInt(memVal);
              return (
                <React.Fragment>
                  <td>{String.fromCharCode((val >> 24) & 0xff)}</td>
                  <td>{String.fromCharCode((val >> 16) & 0xff)}</td>
                  <td>{String.fromCharCode((val >> 8) & 0xff)}</td>
                  <td>{String.fromCharCode(val & 0xff)}</td>
                </React.Fragment>
              );
            })
          )}
        </tr>
      );
    })
  );
  return (
    <table className="table text-center memory">
      <thead>
        <tr>
          <th>Memory Address</th>
          <th>3 - 0</th>
          <th>7 - 4</th>
          <th>11 - 8</th>
          <th>15 - 12</th>
          <th colSpan={4}>ASCII</th>
          <th colSpan={4}>ASCII</th>
          <th colSpan={4}>ASCII</th>
          <th colSpan={4}>ASCII</th>
        </tr>
      </thead>
      <tbody>{output}</tbody>
    </table>
  );
}
