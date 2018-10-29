import React from "react";
import { Provider } from "react-redux";
import { JssProvider } from "react-jss";
import CssBaseline from "@material-ui/core/CssBaseline";
import createStore from "./src/state/store";
import { MuiThemeProvider } from "@material-ui/core/styles";
import getPageContext from "./src/getPageContext";

export const onInitialClientRender = function() {
  const ssStyles = window.document.getElementById("server-side-jss");
  ssStyles && ssStyles.parentNode.removeChild(ssStyles);
};

export const wrapRootElement = ({ element }) => {
  const store = createStore();
  const pageContext = getPageContext();
  const ConnectRootElement = (
    <Provider store={store}>
      <JssProvider
        registry={pageContext.sheetsRegistry}
        generateClassName={pageContext.generateClassName}
      >
        <MuiThemeProvider theme={pageContext.theme} sheetsManager={pageContext.sheetsManager}>
          <CssBaseline />
          {React.cloneElement(element, { pageContext })}
        </MuiThemeProvider>
      </JssProvider>
    </Provider>
  );

  return ConnectRootElement;
};
