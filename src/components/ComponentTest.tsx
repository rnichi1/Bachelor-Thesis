import * as React from "react";

class ComponentTest extends React.Component {
  constructor(props: {}) {
    super(props);
  }
  render() {
    return (
      <div className={"internal div"}>
        <div>
          <div>hi</div>
        </div>
      </div>
    );
  }
}

export class ComponentInternal extends React.Component {
  constructor(props: {}) {
    super(props);
  }

  render() {
    return (
      <div className={"internal div"}>
        <div>
          <div>hi</div>
        </div>
      </div>
    );
  }
}

export default ComponentTest;
