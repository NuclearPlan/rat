import "bootstrap/dist/css/bootstrap-theme.css";
import "bootstrap/dist/css/bootstrap.css";
import "./styles/menu.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "./App";
import ControlSocket from "./control";

ControlSocket.connect();

ReactDOM.render(
    <App />,
    document.getElementById("root")
);
