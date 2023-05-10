import React from "react";

export default function Pipeline(props) {
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
