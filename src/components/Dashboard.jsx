import React, { useState, useEffect } from "react";

export default function Dashboard(props) {
  const [nerdStats, setNerdStats] = useState({
    memory: {
      PC: 0,
      endian: false,
      no_of_bytes: 0,
      no_of_reg: 0,
      size_of_reg: 32,
      size_of_data: 32,
      size_of_inst: 32,
      size_of_addr: 32,
      reg: {
        read: 0,
        write: 0,
      },
      data: {
        read: 0,
        write: 0,
      },
    },
    pipeline: {
      no_of_stages: 4,
      stages: ["IF", "ID", "EX", "MM", "WB"],
      no_of_cycles: 0,
      no_of_inst: 0,
      no_of_stalls: 0,
      no_of_kills: 0,
    },
    processor: {
      no_of_inst: 0,
      operational_flgs: {
        kill_IF: false,
        redo_ID: false,
        tkn_branch: false,
        enabled_data_forwarding: false,
      },
      comp_flgs: {
        G: false,
        L: false,
        E: false,
        GE: false,
        LE: false,
      },
    },
  });

  useEffect(() => {
    setNerdStats(props.nerdStats);
  }, [props.nerdStats]);

  return (
    <div
      className="modal fade"
      id="statsModal"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-center" id="exampleModalLabel">
              Dragonfly Run Stats
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row gx-2 gy-2">
                <div className="col-md-6">
                  <h4 className="fw-bold mt-1">Pipeline Stages</h4>
                  <div className="border border-2 shadow-sm p-1">
                    <table className="table table-borderless p-0 m-1">
                      <tbody>
                        <tr>
                          <th className="badge w-100 text-dark text-center border">
                            ID
                          </th>
                          <td>Instruction Fetch</td>
                        </tr>
                        <tr>
                          <th className="badge bg-danger w-100 text-center border">
                            ID
                          </th>
                          <td>Instruction Decode</td>
                        </tr>
                        <tr>
                          <th className="badge bg-warning w-100 text-center border">
                            EX
                          </th>
                          <td>Execute</td>
                        </tr>
                        <tr>
                          <th className="badge bg-primary w-100 text-center border">
                            MEM
                          </th>
                          <td>Memory</td>
                        </tr>
                        <tr>
                          <th className="badge bg-success w-100 text-center border">
                            WB
                          </th>
                          <td>Writeback</td>
                        </tr>
                        <tr>
                          <th className="badge bg-dark w-100 text-center border">
                            STALL
                          </th>
                          <td>STALL / Bubble</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-md-6">
                  <h4 className="fw-bold mt-1">Flgs & Info</h4>
                  <div className="border border-2 shadow-sm p-1">
                    <table className="table table-borderless p-0 m-1">
                      <tbody>
                        <tr>
                          <th>Data Forwarding</th>
                          <td>
                            If{" "}
                            <span className="bg-success ps-1 pe-1 rounded text-center align-center text-white me-1">
                              enabled
                            </span>
                            , enables data forwarding from execute and memory
                            buffers to other stages in pipeline without waiting
                            for writeback.
                          </td>
                        </tr>
                        <tr>
                          <th>Endian Type</th>
                          <td>
                            If{" "}
                            <span className="bg-success ps-1 pe-1 rounded text-center align-center text-white me-1">
                              enabled
                            </span>
                            , changes to big endian. Doesn't effect the
                            computation. Only the way it is stored in memory is
                            effected.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-md-6">
                  <h4 className="fw-bold mt-1">Memory:</h4>
                  <table className="table m-0 p-0 border border-2 shadow-sm">
                    <tbody>
                      <tr>
                        <th scope="row">PC</th>
                        <td>{nerdStats.memory.PC}</td>
                      </tr>
                      <tr>
                        <th scope="row">Endian Type</th>
                        <td>
                          {nerdStats.memory.endian
                            ? "Little Endian"
                            : "Big Endian"}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Memory Size</th>
                        <td>{nerdStats.memory.no_of_bytes}</td>
                      </tr>
                      <tr>
                        <th scope="row">Number of Registers</th>
                        <td>{nerdStats.memory.no_of_reg}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h4 className="fw-bold mt-1">Pipeline:</h4>
                  <table className="table m-0 p-0 border border-2 shadow-sm">
                    <tbody>
                      <tr>
                        <th scope="row">Cycles:</th>
                        <td>{nerdStats.pipeline.no_of_cycles}</td>
                      </tr>
                      <tr>
                        <th scope="row">Instructions:</th>
                        <td>{nerdStats.pipeline.no_of_inst}</td>
                      </tr>
                      <tr>
                        <th scope="row">Stalls:</th>
                        <td>{nerdStats.pipeline.no_of_stalls}</td>
                      </tr>
                      <tr>
                        <th scope="row">Kills:</th>
                        <td>{nerdStats.pipeline.no_of_kills}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-12">
                  <h4 className="fw-bold mt-1">Processor:</h4>
                  <div className="border border-2 shadow-sm p-1">
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <th scope="row">Operational Flags:</th>
                          <td>
                            <table className="table m-0 p-0 border border-2 shadow-sm">
                              <tbody>
                                <tr>
                                  <th scope="row">Kill IF</th>
                                  <td>
                                    {nerdStats.processor.operational_flgs
                                      .kill_IF ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Redo ID</th>
                                  <td>
                                    {nerdStats.processor.operational_flgs
                                      .redo_ID ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Taken Branch</th>
                                  <td>
                                    {nerdStats.processor.operational_flgs
                                      .tkn_branch ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">Enable Data Forwarding</th>
                                  <td>
                                    {nerdStats.processor.operational_flgs
                                      .enabled_data_forwarding ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Comparison Flags:</th>
                          <td>
                            <table className="table m-0 p-0 border border-2 shadow-sm">
                              <tbody>
                                <tr>
                                  <th scope="row">G</th>
                                  <td>
                                    {nerdStats.processor.comp_flgs.G ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">L</th>
                                  <td>
                                    {nerdStats.processor.comp_flgs.L ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">E</th>
                                  <td>
                                    {nerdStats.processor.comp_flgs.E ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">GE</th>
                                  <td>
                                    {nerdStats.processor.comp_flgs.GE ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">LE</th>
                                  <td>
                                    {nerdStats.processor.comp_flgs.LE ? (
                                      <span className="badge bg-success">
                                        True
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger">
                                        False
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-md-6">
                  <h4 className="fw-bold mt-1">Memory Accesses</h4>
                  <div className="border border-2 shadow-sm p-1">
                    <table className="table">
                      <tbody>
                        <tr>
                          <th scope="row">Reg Reads</th>
                          <td>{nerdStats.memory.reg.read}</td>
                        </tr>
                        <tr>
                          <th scope="row">Reg Writes</th>
                          <td>{nerdStats.memory.reg.write}</td>
                        </tr>
                        <tr>
                          <th scope="row">Mem Reads</th>
                          <td>{nerdStats.memory.data.read}</td>
                        </tr>
                        <tr>
                          <th scope="row">Mem Writes</th>
                          <td>{nerdStats.memory.data.write}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
