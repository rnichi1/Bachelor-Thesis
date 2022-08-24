import * as React from "react";

class ComponentTest extends React.Component {
  constructor(props: {}) {
    super(props);
  }
  render() {
    return (
      <ComponentInternal>
        <h2>Hi, I am a Car!{this.props.children}</h2>
      </ComponentInternal>
    );
  }
}

export class ComponentInternal extends React.Component {
  constructor(props: {}) {
    super(props);
  }

  render() {
    return <div className={"internal div"}>{this.props.children}</div>;
  }
}

export default ComponentTest;
