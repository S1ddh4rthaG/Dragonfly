export default function InfoModal() {
  return (
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
            <h5 className="modal-title" id="exampleModalLabel">
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
              This simulator is a work in progress and is not yet complete. It
              is based on the Dragonfly ISA and is intended to be used for
              educational purposes only.
            </p>
            <p>
              The simulator is currently in beta and does not support all
              instructions. The simulator is also not guaranteed to be bug-free.
              If you find any bugs, please report them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
