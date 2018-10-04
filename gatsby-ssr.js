import React from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
require("dotenv").config();

import createStore from "./src/state/store";
import theme from "./src/styles/theme";

export const replaceRenderer = ({ bodyComponent, replaceBodyHTMLString }) => {
  const store = createStore();

  replaceBodyHTMLString(renderToString(<Provider store={store}>{bodyComponent}</Provider>));
};

export const onRenderBody = ({ setPostBodyComponents }) => {
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
