// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services
{
    public class JsHelper
    {
        public static string GetErrorsFromConsoleScript = "var compoundMessage = ''; " +
            "console.uiTestsErrors.forEach(el => el.forEach(el2 => {compoundMessage+=el2.toString(); compoundMessage+=el2.stack})); " +
            "return compoundMessage";

        //to make work with browser and driver
        private readonly Func<string, bool> _executeJavaScriptWithBoolResult;
        private readonly Action<string> _executeJavaScript;

        public JsHelper(BrowserWrapper browser)
        {
            _executeJavaScriptWithBoolResult = browser.ExecuteJavaScript<bool>;
            _executeJavaScript = browser.ExecuteJavaScript;
        }

        public JsHelper(UtfWebDriver driver)
        {
            bool GetExecuteJsWithReturnBoolValue(string script)
            {
                return (bool)driver.SwitchToRootDocument().ExecuteJavaScript(script);
            }

            void GetExecuteJsWithoutReturnlValue(string script)
            {
                driver.SwitchToRootDocument().ExecuteJavaScript(script);
            }

            _executeJavaScriptWithBoolResult = GetExecuteJsWithReturnBoolValue;
            _executeJavaScript = GetExecuteJsWithoutReturnlValue;
        }
    }
}
