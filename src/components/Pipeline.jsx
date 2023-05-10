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

function Memory(props) {
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

function Registers(props) {
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

function Pipeline(props) {
  const core = props.DATA;
  const corePipeline = core.pipelineState;
  const pplCycles = core.cycles;

  let pipelineTable = Array(core.pipeID);
  for (let i = 0; i < core.pipeID; i++) {
    pipelineTable[i] = Array(core.cycles).fill("");
  }

  let instructionTable = [];
  let tracker = [];

  corePipeline.forEach((cycle) => {
    const { IF, ID, EX, MM, WB } = cycle;
    const stages = [IF, ID, EX, MM, WB];

    stages.forEach((stg) => {
      if (stg.pipeID !== undefined) {
        if (stg.val === "IF" && stg.inst && !tracker.includes(stg.pipeID)) {
          instructionTable.push([stg.inst]);
          tracker.push(stg.pipeID);
        }
        pipelineTable[stg.pipeID][stg.clk] = { val: stg.val, inst: stg.inst };
      }
    });
  });

  let pipelineColors = [];
  pipelineColors["IF"] = "";
  pipelineColors["ID"] = "fw-bold bg-danger";
  pipelineColors["EX"] = "fw-bold bg-warning";
  pipelineColors["MM"] = "fw-bold bg-primary";
  pipelineColors["WB"] = "fw-bold bg-success";
  pipelineColors["STALL"] = "bg-dark text-white fw-bold";
  pipelineColors["KILL"] = "bg-dark text-white fw-bold";

  let pipeline = pipelineTable.map((instComplete, instIndex) => {
    let reactInst = (
      <tr key={instIndex}>
        <td>
          {instructionTable[instIndex]
            ? instructionTable[instIndex].join(",")
            : ""}
        </td>
        {React.Children.toArray(
          instComplete.map((clkStage, clkIndex) => {
            return clkStage ? (
              <td className={"border-dark " + pipelineColors[clkStage.val]}>
                {clkStage.val}
              </td>
            ) : (
              <td className="stg-empty"></td>
            );
          })
        )}
      </tr>
    );

    return reactInst;
  });

  return (
    <table className="table table-borderless pipeline">
      <thead>
        <tr>
          <th>Inst/Clk</th>
          {React.Children.toArray(
            Array(pplCycles)
              .fill(0)
              .map((val, index) => {
                return <th>{index + 1}</th>;
              })
          )}
        </tr>
      </thead>
      <tbody className="table-group-divider">{pipeline}</tbody>
    </table>
  );
}

export { Pipeline, Registers, Memory };
