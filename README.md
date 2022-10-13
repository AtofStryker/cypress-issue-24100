# Installing

```
npm install
```

Make sure Chrome 106+ is installed along with Edge 106.

# Steps to reproduce
Note: this might take a bit of time to paint a full picture.

1. To begin, run the following first
    ```
    DEBUG=cypress-verbose:proxy:http npx cypress open
    ```

    This will enable logs for Cypress' middleware proxy to get a deeper understanding of requests made.

    Select Chrome 106 and run `spec.cy.js`

    When redirecting to Okta, the `cy.get('#okta-signin-username').type('test');` is never invoked and doesn't make it to the command log

    look for the following log message:
    ```
    cypress-verbose:proxy:http GET https://cypress-io.okta.com/login/login.htm?fromURI=%2Fapp%2Fgoogle%2Fexk684pc44... IncomingResponse injection levels: { isInitial: false, wantsInjection: false, wantsSecurityRemoved: true } +0ms
    ```

    wantsInjection should  be `fullCrossOrigin`
2. Now go back to the cypress app and click the `Close` button to close the chrome browser

    open either Edge 106 or Electron (which is shipped with Cypress) and run `spec.cy.js`

    When redirecting to Okta, the `cy.get('#okta-signin-username').type('test');` is invoked as expected

    look for the following log message in the terminal:
    ```
    cypress-verbose:proxy:http GET https://cypress-io.okta.com/login/login.htm?fromURI=%2Fapp%2Fgoogle%2Fexk684pc44... IncomingResponse injection levels: { isInitial: false, wantsInjection: 'fullCrossOrigin', wantsSecurityRemoved: true } +0ms
    ```

    wantsInjection should and is `fullCrossOrigin`


3. The area of code that handles this inside cypress is inside the [response-middleware](https://github.com/cypress-io/cypress/blob/develop/packages/proxy/lib/http/response-middleware.ts#L262). For some reason in chrome, `isAUTFrame` is set to false. This header is added to the request via CDP when ['Fetch.requestPaused'](https://github.com/cypress-io/cypress/blob/develop/packages/server/lib/browsers/chrome.ts#L405) is called for requests being made through the app.

    Now, similar to above, run Cypress with the following debug flags:
   ```
    DEBUG=cypress:server:browsers:chrome npx cypress open
    ```

    This will enable logs for Cypress' CDP used in chromium browsers (edge and chrome in out case) to get a deeper understanding of requests being intercepted by `Fetch.requestPaused`.


    First, open Edge 106 and run `spec.cy.js`

    Look for the following log message in the terminal:

    ```
    cypress:server:browsers:chrome add X-Cypress-Is-AUT-Frame header to: https://cypress-io.okta.com/login/login.htm
    ```

    This is what attached the `X-Cypress-Is-AUT-Frame` to the request for us to determine injection in the proxy.

    Now, open Chrome 106 and run `spec.cy.js`
 

    Look for the following log message in the terminal:

    ```
    cypress:server:browsers:chrome add X-Cypress-Is-AUT-Frame header to: https://cypress-io.okta.com/login/login.htm
    ```

    You will not be able to find it because it does not exist, along with other interceptions not being made by `Fetch.RequestPaused`. This seems like a bug in chrome and chromium and not sure why this is the case. 