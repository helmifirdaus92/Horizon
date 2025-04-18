// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Management;
using NUnit.Framework;
using OpenQA.Selenium;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser
{
    public class BrowserWrapper
    {
        private readonly List<string> _knownErrorsInConsole = new()
        {
            // temp fix - don't count errors caused by AppSwitcher"
            "/api/identity/v1/user/",

            // ignoring errors from inventory api
            "/api/inventory/v1/tenants",

            // ignore errors thrown by sxa components
            "Placeholder headless-main contains unknown component Image. Ensure",
            "xmcloudcm.localhost/_next/data/",
            "renderinghost.localhost/_next/static/",
            "/sxa/client/main.js", //Bug 576512

            // ignore errors thrown by components extension
            "components-staging.sitecore-staging.cloud",

            // ignore errors thrown by CORS policy
            "Access to fetch at '\r\nhttps://auth-staging-1.sitecore-staging.cloud/oauth/token\r\n' from origin '\r\nhttps://ah.xmcloudcm.localhost\r\n' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",

            // temp ignore xmclouddeploy-api as we removed Sitecore.Pages.IsLocalXM variable to revive Quill tests
            "xmclouddeploy-api-staging.sitecore-staging.cloud",

            // temp renderinghost config endpoint, as it does not exist for now
            "https://ah.xmcloudcm.localhost/horizon/renderinghost/config",

            "webpack-internal:///./node_modules/next/dist/client/components/react-dev-overlay/",
            "https://eh.xmcloudcm.localhost/_next/webpack-hmr",

            // ignore errors on quill tests '1 Listener added for a 'DOMNodeInserted' mutation event'
            "Listener added for a 'DOMNodeInserted' mutation event",

            //ignore rendering failure error,handled by reload canvas 
            "Connection to your rendering host http://jsshost:3000/api/editing/render failed with the following error: The remote server returned an error: (500) Internal Server Error.",

            //ignore errors from rh-protection feature
            "Access to XMLHttpRequest at \'https://eh.xmcloudcm.localhost/api/editing/config?secret=Headless' from origin 'https://ah.xmcloudcm.localhost' has been blocked by CORS policy:",
            "https://eh.xmcloudcm.localhost/api/editing/config?secret=Headless - Failed to load resource: net::ERR_FAILED"
        };

        private readonly UTF.Browser _browser;
        private readonly UtfWebDriver _driver;

        private List<LogEntry> _errorsToIgnore = new();
        private List<LogEntry> _errorsBeforePause = new();

        public BrowserWrapper(UtfWebDriver driver, UTF.Browser browser)
        {
            _driver = driver;
            _browser = browser;
        }

        public string PageUrl => _browser.Url;
        public string PageText => _browser.GetTextByCssSelector("body");
        public int TabsCount => _driver.WindowHandles.Count;

        public List<string> WindowHandles => _driver.WindowHandles.ToList();

        public Size WindowSize
        {
            get
            {
                int w = Convert.ToInt32(_driver.ExecuteJavaScript("return document.documentElement.clientWidth"));
                int h = Convert.ToInt32(_driver.ExecuteJavaScript("return document.documentElement.clientHeight"));
                return new Size(w, h);
            }
        }


        private UtfWebDriver PageDriver
        {
            get
            {
                _driver.SwitchToRootDocument();
                return _driver;
            }
        }

        private Uri HostUri => new(_browser.Url);

        public void AddMessageToKnownErrorsInConsoleList(string message)
        {
            _knownErrorsInConsole.Add(message);
        }

        public void RemoveMessageFromKnownErrorsInConsoleList(string message)
        {
            _knownErrorsInConsole.Remove(message);
        }

        public void StartConsoleErrorCollection()
        {
            _errorsToIgnore = GetAllBrowserErrors();
            Logger.WriteLineWithTimestamp("Starting to collect logs.  Total number of errors before scenario is:" + _errorsToIgnore.Count);
        }

        public void PauseConsoleErrorCollection()
        {
            _errorsBeforePause = GetAllBrowserErrors();
        }

        public void ResumeConsoleErrorCollection()
        {
            var newErrorsDuringPause = GetAllBrowserErrors().Except(_errorsBeforePause);
            _errorsToIgnore.AddRange(newErrorsDuringPause);
        }

        public bool CheckIfErrorsExistInConsole()
        {
            var errors = GetAllBrowserErrors().Except(_errorsToIgnore);

            foreach (var msg in _knownErrorsInConsole)
            {
                errors = errors.Where(err => !err.Message.Contains(msg));
            }

            if (!errors.Any())
            {
                return false;
            }

            foreach (LogEntry error in errors)
            {
                Logger.WriteLineWithTimestamp("ERROR in the console: " + error.Message);
            }

            return true;
        }

        public void SwitchToRootDocument()
        {
            PageDriver.SwitchToRootDocument();
        }

        public void WaitForDocumentLoaded()
        {
            _driver.WaitForDocumentLoaded();
        }

        public bool CheckElementExists(string cssSelector)
        {
            return _driver.CheckElementExists(cssSelector);
        }

        public void SwitchToWindow(string partialUrl)
        {
            _browser.SwitchToWindow(partialUrl);
        }

        public void CloseCurrentWindow()
        {
            _browser.CloseCurrentWindow();
        }

        public void GoBackInHistory()
        {
            _browser.GoBack();
            PageDriver.WaitForHorizonIsStable();
        }

        public void GoForwardInHistory()
        {
            _browser.GoForward();
            PageDriver.WaitForHorizonIsStable();
        }

        public void QuitSoft()
        {
            _driver.Close();
            _driver.Dispose();
        }

        public void WaitForHorizonIsStable()
        {
            PageDriver.WaitForHorizonIsStable();
        }

        public void WaitForNetworkCalls()
        {
            PageDriver.WaitForNetworkCalls();
        }

        public void WaitForContextMenu()
        {
            _driver.WaitForContextMenu();
        }

        public void ResizeWindow(int? width = null, int? height = null)
        {
            Size size = WindowSize;
            _browser.SetWindowSize(width ?? size.Width, height ?? size.Height);
        }

        public void MaximizeWindow()
        {
            _browser.MaximizeWindow();
        }

        public void Navigate(string url)
        {
            if (!url.Contains("://"))
            {
                url = $"{HostUri.AbsoluteUri}{url}";
            }

            _browser.GoToUrl(url);
            _driver.WaitForHorizonIsStable();
        }

        public void ClearCookies()
        {
            Context.Browser.ClearCookies();
        }

        public void ClearIframeCookies(PageLayout canvasPage)
        {
            canvasPage.ExecuteJavaScript(
                "document.cookie.split(';').forEach(function(c) {document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/'); });");
        }

        public Dictionary<string, string> GetAllCookies()
        {
            return _browser.GetAllCookies();
        }

        public T ExecuteJavaScript<T>(string script)
        {
            return (T)PageDriver.ExecuteJavaScript(script);
        }

        public void ExecuteJavaScript(string script)
        {
            PageDriver.ExecuteJavaScript(script);
        }

        public void Quit()
        {
            QuitSoft();
            TerminateDriverProcess();
        }

        public void Refresh()
        {
            _browser.RefreshPage();
            _driver.WaitForHorizonIsStable();
        }

        public WebElement FindElement(string cssSelector)
        {
            return PageDriver.FindElement(cssSelector, Context.Settings.WaitTimeout, 200);
        }

        public IReadOnlyCollection<WebElement> FindElements(string cssSelector)
        {
            return PageDriver.FindElements(cssSelector);
        }

        public WebElement CheckElement(string cssSelector, int timeout = 200)
        {
            return PageDriver.CheckElement(cssSelector, timeout);
        }

        public FramePage GetFrame(string frameSelector)
        {
            FramePage framePage = new(PageDriver.FindElement(frameSelector));
            framePage.Driver.WaitForDocumentLoaded();
            return framePage;
        }

        public void TakeScreenshot(string fileName)
        {
            string allowedTestName = ScreenshotsHelper.GetValidScreenShotImageName(fileName);
            UtfWebDriver utfWebdriver = this.GetFieldValue<UtfWebDriver>("_driver");
            IWebDriver _driver = utfWebdriver.GetFieldValue<IWebDriver>("_driver");
            Screenshot screenshot = ((ITakesScreenshot)_driver).GetScreenshot();
            string screenshotPath =
                $"{Path.GetFullPath(Path.Combine(Environment.GetEnvironmentVariable("TEMP", EnvironmentVariableTarget.User), allowedTestName))}.jpg";

            screenshot.SaveAsFile(screenshotPath, ScreenshotImageFormat.Jpeg);
            string escapedFileName = Path.GetFileName(screenshotPath);
            Console.WriteLine($"##teamcity[publishArtifacts '{screenshotPath} => /screenshots']");
            Console.WriteLine($@"Screenshot path: /screenshots/{allowedTestName}");
            Console.WriteLine($"##teamcity[testMetadata testName='{allowedTestName}' type='image' value='/screenshots/{escapedFileName}']");
            TestContext.AddTestAttachment(screenshotPath); //attachment for ReportPortal
        }

        public void CloseAllTabsExceptRoot()
        {
            if (TabsCount <= 0)
            {
                return;
            }

            string rootWindow = WindowHandles[0];
            UtfWebDriver utfWebDriver = this.GetFieldValue<UtfWebDriver>("_driver");
            IWebDriver driver = utfWebDriver.GetFieldValue<IWebDriver>("_driver");
            foreach (string windowHandle in WindowHandles.Where(windowHandle => !windowHandle.Equals(rootWindow)))
            {
                driver.SwitchTo().Window(windowHandle);
                driver.Close();
            }

            driver.SwitchTo().Window(rootWindow);
        }

        public IAlert GetAlert()
        {
            return _driver.WaitAlert(10);
        }

        public List<string> GetEmbeddedScripts()
        {
            return PageDriver.FindElements("script").Select(c => c.GetSrc()).ToList();
        }

        public void SwitchToNextTab()
        {
            _driver.SwitchToWindow(_driver.WindowHandles[1]);
            _driver.WaitForDocumentLoaded();
        }

        public void SwitchToRootTab()
        {
            _driver.SwitchToWindow(_driver.WindowHandles[0]);
        }

        public void WaitForDialog()
        {
            _driver.WaitForDialog();
        }

        public void WaitForDotsLoader()
        {
            _driver.WaitForDotsLoader();
        }

        private List<LogEntry> GetAllBrowserErrors()
        {
            List<LogEntry> logs = _driver.Manage().Logs.GetLog(LogType.Browser).Where(l => l.Level == LogLevel.Severe).ToList();
            return logs;
        }

        private void TerminateDriverProcess()
        {
            try
            {
                switch (_browser.Type)
                {
                    case BrowserType.Chrome:
                        KillChildProcess("chromedriver");
                        break;
                    case BrowserType.Firefox:
                        KillChildProcess("geckodriver");
                        break;
                }
            }
            catch (Exception e)
            {
                Logger.WriteLine($"Warn: Failed to terminate driver process.Message: {e.Message}. Stacktrace: {e.StackTrace}");
            }
        }

        private void KillChildProcess(string processName)
        {
            int parentProcessId = Process.GetCurrentProcess().Id;
            ManagementObjectSearcher searcher = new("SELECT * " + "FROM Win32_Process " + "WHERE ParentProcessId=" + parentProcessId);
            ManagementObjectCollection collection = searcher.Get();
            if (collection.Count > 0)
            {
                foreach (ManagementBaseObject item in collection)
                {
                    uint childProcessId = (uint)item["ProcessId"];
                    Process childProcess = Process.GetProcessById((int)childProcessId);

                    string childProcessName = childProcess.ProcessName;
                    if ((int)childProcessId != Process.GetCurrentProcess().Id && processName.Equals(childProcessName, StringComparison.InvariantCultureIgnoreCase))
                    {
                        Logger.WriteLineWithTimestamp("WARNING: Killing the process '" + childProcessName + "' with Id '" + childProcessId + "'");

                        //Taskkill allow us to kill the process forcibly when .Net API fails
                        ProcessStartInfo psi = new()
                        {
                            CreateNoWindow = true,
                            WindowStyle = ProcessWindowStyle.Hidden,
                            FileName = "taskkill",
                            Arguments = "/F /T /PID " + childProcessId
                        };
                        Process.Start(psi);
                    }
                }
            }
        }
    }
}
