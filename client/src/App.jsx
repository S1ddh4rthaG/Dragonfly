import React, { useState } from "react";
import { Pipeline, Registers, Memory } from "./Pipeline";
import dParser from "./Parser";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

import "./index.css";
import RISCv from "./RISCv.png";
import RISC_V from "./Processor";

let core = new RISC_V([]);
function App() {
  const [coreS, setCoreS] = useState(core);
  const [err, setErr] = useState("Important Messages will show up here!");
  const [editor, setEditor] = useState("");

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

  function Run() {
    dParser.setSource(editor);
    const stateRISCV = dParser.convertToRiscV();

    if (stateRISCV[0]) {
      const core = new RISC_V(stateRISCV[1]);
      setErr("-");

      core.startProcessor();
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
                      <div className="d-flex flex-row m-0 p-0 ps-2 pe-2 justify-content-between align-middle">
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
                                <i class="bi bi-code-slash fs-5"></i>
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
                                <i class="bi bi-bar-chart-steps fs-5"></i>
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
                                <i class="bi bi-memory fs-5">
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
                            onClick={Run}
                          >
                            <span className="align-middle">Run</span>
                            <i class="bi bi-play-fill align-middle fs-5"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      className="row m-0 p-0 flex-fill border-bottom tab-content overflow-auto border-top"
                      style={{ height: "700px" }}
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
                      <div className="row m-1 p-0 mt-1 border text-center regs-display">
                        <Registers MEM={coreS.MEM} />
                      </div>
                      <div className="row m-0 p-1 flex-fill text-center">
                        <div className="my-auto mx-auto">
                          <div className="col-lg-8 mx-auto my-auto mt-3">
                            <table className="mx-auto table table-borderless">
                              <thead>
                                <td colSpan={12}>
                                  <img src={RISCv} alt="RISCV Banner" />
                                </td>
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
                                        <i class="bi bi-github text-dark"></i>
                                      </a>
                                      <a
                                        href="https://www.linkedin.com/in/siddharthag22/"
                                        className="p-1 fs-5 me-2"
                                      >
                                        <i class="bi bi-linkedin text-primary"></i>
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
                                        href="/https://github.com/PreethiVarshaM"
                                        className="p-1 fs-5 me-2"
                                      >
                                        <i class="bi bi-github text-dark"></i>
                                      </a>
                                      <a
                                        href="https://www.linkedin.com/in/preethi-varsha-70211b210"
                                        className="p-1 fs-5 me-2"
                                      >
                                        <i class="bi bi-linkedin text-primary"></i>
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
    </div>
  );
}

export default App;
