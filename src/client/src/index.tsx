import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from 'react-redux';

import Layout from './connectors/layout'
import store from "./store/init";

ReactDOM.render(<Provider store={store}><Layout /></Provider>, document.getElementById("app"));