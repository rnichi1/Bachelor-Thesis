import React from 'react';
import {render} from "react-dom";
import {Provider} from "./components";

const App = () => (
    <Provider>
        <div>
            <div>
                <button>
                    this is a normal button
                </button>
            </div>
        </div>
        <Button/>
    </Provider>
);

export default App;

class Button extends React.Component<any, any> {

    render() {
        return (<div><button>this is a class component button</button></div>)
    }
}