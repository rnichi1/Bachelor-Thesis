import * as React from "react";
import { render } from "react-dom";
import { ReactNode } from "react";

class ClassComponentTest extends React.Component<{ children?: ReactNode }> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <button>
        <div>
          <div>hello this is a class component</div>
        </div>
      </button>
    );
  }
}

export default ClassComponentTest;
