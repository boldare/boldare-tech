import React from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import {
  JssProvider,
  SheetsRegistry,
  createGenerateId,
  ThemeProvider as JssThemeProvider
} from "react-jss";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

require("dotenv").config();

import createStore from "./src/state/store";
import createEmotionCache from "./src/styles/createEmotionCache";
import theme from "./src/styles/theme";
import config from "./content/meta/config";

// replaceRenderer is a current, supported Gatsby SSR API. It is used here rather
// than wrapRootElement because the JSS stylesheet can only be serialised after
// the tree has rendered -- the registry is empty until then.
export const replaceRenderer = ({ bodyComponent, replaceBodyHTMLString, setHeadComponents }) => {
  const store = createStore();

  // Fresh per request: neither sheets nor Emotion caches may leak between
  // connections. The provider stack below must mirror gatsby-browser.js exactly.
  const sheets = new SheetsRegistry();
  const generateId = createGenerateId();
  const emotionCache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(emotionCache);

  const html = renderToString(
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <JssProvider registry={sheets} generateId={generateId} id={{ minify: true }}>
          <JssThemeProvider theme={theme}>
            <MuiThemeProvider theme={theme}>
            {/* No <CssBaseline />. src/styles/globals.js already carries a full
                normalize reset (body margin, box-sizing, the html.wf-active
                font switch), and MUI 9's CssBaseline additionally forces
                `body { font-size }` from theme.typography -- computed as
                1rem x (typography.fontSize / 14) = 18.29px, where this design
                inherits 16px from <html>. MUI v3's CssBaseline did not do that,
                so including it here silently restyles every page. */}
              {bodyComponent}
            </MuiThemeProvider>
          </JssThemeProvider>
        </JssProvider>
      </CacheProvider>
    </Provider>
  );

  replaceBodyHTMLString(html);

  // Emotion otherwise injects MUI's styles as a <style> tag inside the body,
  // which the client never reproduces -- an immediate hydration mismatch.
  // Pull them out and put them in <head> where the client expects them.
  const emotionChunks = extractCriticalToChunks(html);

  setHeadComponents([
    <style
      type="text/css"
      id="server-side-jss"
      key="server-side-jss"
      dangerouslySetInnerHTML={{ __html: sheets.toString() }}
    />,
    ...emotionChunks.styles.map(style => (
      <style
        key={`emotion-${style.key}`}
        data-emotion={`${style.key} ${style.ids.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ))
  ]);
};

export const onRenderBody = ({ setHeadComponents, setPostBodyComponents }) => {
  setHeadComponents([
    <script
      key="netlify-identity-token-forwarding"
      dangerouslySetInnerHTML={{
        __html: `(function () {
  var hash = window.location.hash;
  if (!hash) return;
  if (!/[#&](invite_token|recovery_token|confirmation_token|email_change_token|access_token)=/.test(hash)) return;
  var panel = ${JSON.stringify(`${config.cmsOrigin.replace(/\/$/, "")}/admin/`)};
  if (window.location.href.indexOf(panel) === 0) return;
  window.location.replace(panel + hash);
})();`
      }}
    />
  ]);

  return setPostBodyComponents([
    <div key="fb-root" id="fb-root" />,
    <link
      key={`webfontsloader-load`}
      href="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
      as="script"
    />,
    <script
      key={`webfontsloader-setup`}
      dangerouslySetInnerHTML={{
        __html: `
        WebFontConfig = {
          google: {
            families: ["${theme.base.fonts.styledFamily}:${theme.base.fonts.styledFonts}"]
          }
        };

        (function(d) {
            var wf = d.createElement('script'), s = d.scripts[0];
            wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
            wf.async = true;
            s.parentNode.insertBefore(wf, s);
        })(document);`
      }}
    />,
    <script
      key={`fb-setup`}
      dangerouslySetInnerHTML={{
        __html: `(function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.12&appId=${
            process.env.FB_APP_ID ? process.env.FB_APP_ID : ""
          }&autoLogAppEvents=1';
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));`
      }}
    />
  ]);
};
