import React from "react";
import { Provider } from "react-redux";
import { CacheProvider } from "@emotion/react";
import {
  JssProvider,
  createGenerateId,
  ThemeProvider as JssThemeProvider
} from "react-jss";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

import createStore from "./src/state/store";
import createEmotionCache from "./src/styles/createEmotionCache";
import theme from "./src/styles/theme";

const emotionCache = createEmotionCache();

export const onInitialClientRender = function() {
  const ssStyles = window.document.getElementById("server-side-jss");
  ssStyles && ssStyles.parentNode.removeChild(ssStyles);
};

// This stack must mirror gatsby-ssr.js exactly -- same providers, same order,
// same class-name generator. Any asymmetry shows up as a hydration mismatch,
// which React 18 answers by throwing the server-rendered tree away and
// re-rendering everything on the client.
//
// Both theme providers get the same theme object on purpose. Under MUI v3 only
// MuiThemeProvider was here: MUI v3 and react-jss v8 shared a theme broadcast
// channel (the `theming` + `brcast` packages), so injectSheet's `theme => ({...})`
// style functions picked the theme up for free. MUI v5+ moved to Emotion and
// that channel is gone, so react-jss needs its own ThemeProvider or all 31
// styled components see `theme === undefined`.
export const wrapRootElement = ({ element }) => {
  const store = createStore();

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <JssProvider generateId={createGenerateId()} id={{ minify: true }}>
          <JssThemeProvider theme={theme}>
            <MuiThemeProvider theme={theme}>
            {/* No <CssBaseline />. src/styles/globals.js already carries a full
                normalize reset (body margin, box-sizing, the html.wf-active
                font switch), and MUI 9's CssBaseline additionally forces
                `body { font-size }` from theme.typography -- computed as
                1rem x (typography.fontSize / 14) = 18.29px, where this design
                inherits 16px from <html>. MUI v3's CssBaseline did not do that,
                so including it here silently restyles every page. */}
              {element}
            </MuiThemeProvider>
          </JssThemeProvider>
        </JssProvider>
      </CacheProvider>
    </Provider>
  );
};
