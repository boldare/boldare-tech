import React from "react";
import { Provider } from "react-redux";
import createStore from "./src/state/store";

export const onInitialClientRender = function() {
  const ssStyles = window.document.getElementById("server-side-jss");
  ssStyles && ssStyles.parentNode.removeChild(ssStyles);
};

export const wrapRootElement = ({ element }) => {
  const store = createStore();
  const ConnectRootElement = <Provider store={store}>{element}</Provider>;

  return ConnectRootElement;
};
