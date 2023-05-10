import React from "react";
const reg_names = {
  0: "zero",
  1: "ra",
  2: "sp",
  3: "gp",
  4: "tp",
  5: "t0",
  6: "t1",
  7: "t2",
  8: "s0",
  9: "s1",
  10: "a0",
  11: "a1",
  12: "a2",
  13: "a3",
  14: "a4",
  15: "a5",
  16: "a6",
  17: "a7",
  18: "s2",
  19: "s3",
  20: "s4",
  21: "s5",
  22: "s6",
  23: "s7",
  24: "s8",
  25: "s9",
  26: "s10",
  27: "s11",
  28: "t3",
  29: "t4",
  30: "t5",
  31: "t6",
};

export default function Registers(props) {
  const reg = props.MEM.REG;
  const sets = [reg.slice(0, 16), reg.slice(16, 32)];

  let output = [];
  sets.forEach((set, index) => {
    output.push(
      <div key={index} className="col-lg-6 m-0 p-0">
        <table className="table">
          <thead>
            <tr>
              <td className="fw-bold font-secondary">Reg</td>
              <td className="fw-bold font-secondary">Value</td>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {React.Children.toArray(
              set.map((val, ind) => {
                return (
                  <tr>
                    <td>
                      x{index * 16 + ind} - {reg_names[index * 16 + ind]}
                    </td>
                    {props.MEM.toHEX(val, 8) === "00000000" ? (
                      <td>0x{props.MEM.toHEX(val, 8)}</td>
                    ) : (
                      <td className="text-primary">
                        0x{props.MEM.toHEX(val, 8)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  });
  return output;
}
