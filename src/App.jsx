import React, { useState } from "react";

// Components
import Pipeline from "./components/Pipeline";
import Memory from "./components/Memory";
import Registers from "./components/Registers";

import Dashboard from "./components/Dashboard";

// Parser
import dParser from "./core/Parser";

// Ace editor
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "./index.css";

// Core
import RISC_V from "./core/Processor";
let core = new RISC_V([]);

function App() {
  const [coreS, setCoreS] = useState(core); // Core State
  const [err, setErr] = useState("Important Messages will show up here!"); // Error State
  const [editor, setEditor] = useState(""); // Editor State
  const [dataForwarding, setDataForwarding] = useState(false); // Data Forwarding State
  const [endian, setEndian] = useState(false); // Endian State
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
  }); // Nerd Stats State

  const [stats, setStats] = useState({
    IP: 0,
    cycles: 0,
    kills: 0,
    stalls: 0,
    CPI: 0,
    "CPI w/o stalls": 0,
    "CPI w/o stalls and kills": 0,
  });

  // Editor
  function changed(value) {
    setEditor(value);
    dParser.setSource(value);
    const stateRISCV = dParser.convertToRiscV();

    if (stateRISCV[0]) {
      setErr("-");
    } else {
      setErr(stateRISCV[2]);
    }
  }

  // Run
  function run() {
    dParser.setSource(editor);
    const stateRISCV = dParser.convertToRiscV();

    if (stateRISCV[0]) {
      const core = new RISC_V(stateRISCV[1]);
      core.enabledDF = dataForwarding;
      core.MEM.endian = endian;

      setErr("-");

      core.startProcessor();
      setStats({
        IP: core.MEM.PC,
        inst: core.MEM.PC / 4,
        cycles: core.cycles,
        kills: core.kills,
        stalls: core.stalls,
        CPI: core.cycles / (core.MEM.PC / 4),
      });

      setNerdStats({
        memory: {
          PC: core.MEM.PC,
          endian: core.MEM.endian,
          no_of_bytes: core.MEM.MEM.length,
          no_of_reg: core.MEM.REG.length,
          reg: {
            read: core.MEM.regReads,
            write: core.MEM.regWrites,
          },
          data: {
            read: core.MEM.memReads,
            write: core.MEM.memWrites,
          },
        },
        pipeline: {
          no_of_cycles: core.cycles,
          no_of_inst: core.MEM.PC / 4,
          no_of_stalls: core.stalls,
          no_of_kills: core.kills,
        },
        processor: {
          no_of_inst: core.MEM.PC / 4,
          operational_flgs: {
            kill_IF: core.killIF,
            redo_ID: core.redoID,
            tkn_branch: core.tknBranch,
            enabled_data_forwarding: core.enabledDF,
          },
          comp_flgs: {
            G: core.CompFlags.G,
            L: core.CompFlags.L,
            E: core.CompFlags.E,
            GE: core.CompFlags.GE,
            LE: core.CompFlags.LE,
          },
        },
      });
      setCoreS(core);
    } else {
      setErr(stateRISCV[2]);
    }
  }

  return (
    <div className="row p-0 m-0 h-100">
      <div className="col m-0 p-0">
        <div className="container-fluid h-100 p-2">
          <div className="row m-0 p-0 h-100">
            <div className="col-lg-8 p-0 pe-md-2 pb-2 pb-md-0">
              <div className="d-flex flex-column gap-2 p-0 h-100">
                <div className="row m-0 flex-fill border bg-white rounded-2">
                  <div className="d-flex flex-column p-0">
                    <div className="row m-0 p-1 border-bottom">
                      <div className="d-flex flex-row m-0 p-0 ps-2 pe-2 justify-content-between border-bottom mb-1 align-middle">
                        <div className="col my-auto">
                          <h4 className="fw-bold my-auto">Dragonfly</h4>
                        </div>
                        <div>
                          <ul
                            className="nav nav-pills toolbar"
                            id="pills-tab"
                            role="tablist"
                          >
                            <li className="nav-item" role="presentation">
                              <button
                                className="nav-link pt-1 pb-1 active"
                                id="pills-code-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#editor"
                                type="button"
                                role="tab"
                                aria-controls="pills-code"
                                aria-selected="true"
                              >
                                <i className="bi bi-code-slash fs-5"></i>
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button
                                className="nav-link pt-1 pb-1"
                                id="pills-profile-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#pills-pipeline"
                                type="button"
                                role="tab"
                                aria-controls="pills-pipeline"
                                aria-selected="false"
                              >
                                <i className="bi bi-bar-chart-steps fs-5"></i>
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button
                                className="nav-link pt-1 pb-1 "
                                style={{ paddingRight: "2rem" }}
                                id="pills-contact-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#pills-memory"
                                type="button"
                                role="tab"
                                aria-controls="pills-memory"
                                aria-selected="false"
                              >
                                <i className="bi bi-memory fs-5">
                                  <span
                                    className="fw-bold position-fixed"
                                    style={{ fontSize: "14px" }}
                                  >
                                    4kb
                                  </span>
                                </i>
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="col text-end my-auto">
                          <button
                            className="btn btn-outline-dark fw-bold"
                            onClick={run}
                          >
                            <span className="align-middle">Run</span>
                            <i className="bi bi-play-fill align-middle fs-5"></i>
                          </button>
                        </div>
                      </div>
                      <div className="d-flex flex-row m-0 p-0 ps-2 pe-2 m-1 justify-content-between align-middle">
                        <div className="row w-100">
                          <div className="col-5 p-2">
                            <span className="badge bg-success">
                              {stats.cycles} Cycles
                            </span>
                            <span className="badge bg-danger ms-1">
                              {stats.stalls} Stalls
                            </span>
                            <span className="badge bg-warning ms-1">
                              {stats.kills} Kills
                            </span>

                            <span className="badge bg-primary ms-1">
                              {stats.IP} IP
                            </span>
                            <span className="badge bg-secondary ms-1">
                              {stats.CPI.toFixed(2)} CPI
                            </span>
                          </div>
                          <div className="col-5 p-1">
                            <div className="form-check form-switch d-inline-block me-5">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="flexSwitchCheckDefault"
                                onChange={() =>
                                  setDataForwarding(!dataForwarding)
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor="flexSwitchCheckDefault"
                              >
                                Data Forwarding
                              </label>
                            </div>
                            <div className="form-check form-switch d-inline-block">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="flexSwitchCheckDefault"
                                onChange={() => setEndian(!endian)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="flexSwitchCheckDefault"
                              >
                                {endian ? "Little Endian" : "Big Endian"}
                              </label>
                            </div>
                          </div>
                          <div className="col-2">
                            <button
                              type="button"
                              className="btn btn-outline-dark d-inline-block m-1"
                              data-bs-toggle="modal"
                              data-bs-target="#statsModal"
                            >
                              <i className="bi bi-bar-chart-fill"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-dark d-inline-block m-1"
                              data-bs-toggle="modal"
                              data-bs-target="#infoModal"
                            >
                              <i className="bi bi-info-circle"></i>
                            </button>
                          </div>

                          <div
                            className="modal fade"
                            id="infoModal"
                            tabIndex="-1"
                            aria-labelledby="exampleModalLabel"
                            aria-hidden="true"
                          >
                            <div className="modal-dialog modal-dialog-centered">
                              <div className="modal-content">
                                <div className="modal-header">
                                  <h5
                                    className="modal-title"
                                    id="exampleModalLabel"
                                  >
                                    Dragonfly Simulator
                                  </h5>
                                  <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                  ></button>
                                </div>
                                <div className="modal-body">
                                  <p>
                                    This simulator is a work in progress and is
                                    not yet complete. It is based on the
                                    Dragonfly ISA and is intended to be used for
                                    educational purposes only.
                                  </p>
                                  <p>
                                    The simulator is currently in beta and does
                                    not support all instructions. The simulator
                                    is also not guaranteed to be bug-free. If
                                    you find any bugs, please report them.
                                  </p>

                                  <div className="stats-board d-flex flex-row justify-content-between"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="row m-0 p-0 flex-fill border-bottom tab-content overflow-auto border-top"
                      style={{ height: "500px" }}
                      id="pills-tabContent"
                    >
                      <div
                        className="tab-pane fade p-0 show active"
                        id="editor"
                        role="tabpanel"
                        aria-labelledby="pills-code-tab"
                        tabIndex="0"
                      >
                        <AceEditor
                          mode="java"
                          theme="github"
                          height="100%"
                          width="100%"
                          fontSize={18}
                          onChange={changed}
                          editorProps={{ $blockScrolling: true }}
                        />
                      </div>
                      <div
                        className="tab-pane fade p-0 "
                        id="pills-pipeline"
                        role="tabpanel"
                        aria-labelledby="pills-pipeline-tab"
                        tabIndex="0"
                      >
                        <Pipeline DATA={coreS} />
                      </div>
                      <div
                        className="tab-pane fade p-0 "
                        id="pills-memory"
                        role="tabpanel"
                        aria-labelledby="pills-memory-tab"
                        tabIndex="0"
                      >
                        <Memory MEM={coreS.MEM} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row m-0 p-0 border overflow-auto rounded">
                  <div className="d-flex flex-column p-0 m-0 bg-white">
                    <div className="row m-0 p-1 ca-secondary text-white border-bottom">
                      <h5 className="ps-2 fw-bold my-auto">Logs</h5>
                    </div>
                    <div className="row m-0 p-1 flex-fill">
                      <span className="fw-bold text-danger fs-6">{err}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 p-0 m-0 mt-2 mt-lg-0">
              <div className="row m-0 p-0 h-100">
                <div className="d-flex flex-column m-0 p-0">
                  <div className="row m-0 p-0 overflow-auto h-100">
                    <div className="d-flex flex-column m-0 p-0 overflow-auto border rounded">
                      <div className="row m-0 p-0 border-bottom">
                        <h5 className="p-2 ps-3 fw-bold my-auto ca-secondary text-white">
                          Registers
                        </h5>
                      </div>
                      <div className="row m-1 p-0 mt-1 text-center regs-display">
                        <Registers MEM={coreS.MEM} />
                      </div>
                      <div className="row m-0 p-1 flex-fill text-center">
                        <div className="my-auto mx-auto">
                          <div className="col-lg-8 mx-auto my-auto mt-3">
                            <table className="mx-auto table table-borderless">
                              <thead>
                                <tr>
                                  <td colSpan="12" className="fw-bold">
                                    <span className="bg-dark text-white p-1 ps-2 pe-2  rounded">
                                      Contributors
                                    </span>
                                  </td>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="text-start align-middle fw-bold">
                                    Siddhartha G
                                  </td>
                                  <td className="text-center" colSpan={2}>
                                    <div className="social">
                                      <a
                                        href="https://github.com/S1ddh4rthaG"
                                        className="p-1 fs-5 me-2"
                                      >
                                        <i className="bi bi-github text-dark"></i>
                                      </a>
                                      <a
                                        href="https://www.linkedin.com/in/siddharthag22/"
                                        className="p-1 fs-5 me-2"
                                      >
                                        <i className="bi bi-linkedin text-primary"></i>
                                      </a>
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="text-start align-middle fw-bold">
                                    Preethi Varsha M
                                  </td>
                                  <td className="text-center" colSpan={2}>
                                    <div className="social">
                                      <a
                                        href="https://github.com/PreethiVarshaM"
                                        className="p-1 fs-5 me-2"
                                      >
                                        <i className="bi bi-github text-dark"></i>
                                      </a>
                                      <a
                                        href="https://www.linkedin.com/in/preethi-varsha-70211b210"
                                        className="p-1 fs-5 me-2"
                                      >
                                        <i className="bi bi-linkedin text-primary"></i>
                                      </a>
                                    </div>
                                  </td>
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
          </div>
        </div>
      </div>
      <Dashboard nerdStats={nerdStats} />
    </div>
  );
}

export default App;
