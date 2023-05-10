export default function Contributors() {
  return (
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
  );
}
