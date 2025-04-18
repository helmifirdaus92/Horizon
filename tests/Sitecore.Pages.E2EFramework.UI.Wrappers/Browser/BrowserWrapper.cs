// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Drawing;
using System.Web;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser
{
    public class BrowserWrapper
    {
        private readonly IWebDriver _driver;
        private readonly List<string> _knownErrorsInConsole = new()
        {
            //Add list to ignore here
        };
        private List<LogEntry> _errorsToIgnore = new();
        private List<LogEntry> _errorsBeforePause = new();

        public BrowserWrapper(IWebDriver driver)
        {
            _driver = driver;
        }

        public string PageUrl => _driver.Url;
        public NameValueCollection Queries => HttpUtility.ParseQueryString(new Uri(PageUrl).Query);
        public int TabsCount => _driver.WindowHandles.Count;
        public IWebDriver RootDriver => _driver.SwitchTo().DefaultContent();

        public IWebDriver GetDriver()
        {
            return _driver;
        }

        public string GetText()
        {
            return _driver.GetBrowserText("body");
        }
        public IWebElement FindElement(string cssSelector)
        {
            return _driver.FindElement(By.CssSelector(cssSelector));
        }

        public ReadOnlyCollection<IWebElement> FindElements(string cssSelector)
        {
            return _driver.FindElements(cssSelector);
        }
        public void StartConsoleErrorCollection()
        {
            _errorsToIgnore = GetAllBrowserErrors();
            Console.WriteLine("Starting to collect logs.  Total number of errors before scenario is:" + _errorsToIgnore.Count);
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
                Console.WriteLine("ERROR in the console: " + error.Message);
            }

            return true;
        }
        private List<LogEntry> GetAllBrowserErrors()
        {
            List<LogEntry> logs = _driver.Manage().Logs.GetLog(LogType.Browser).Where(l => l.Level == LogLevel.Severe).ToList();
            return logs;
        }

        public void GoToUrl(Uri uri)
        {
            _driver.Navigate().GoToUrl(uri);
        }

        public (IWebDriver, Point) GetFrame(string frameSelector)
        {
            _driver.SwitchTo().DefaultContent();
            var point = _driver.FindElement(frameSelector).Location;
            return (_driver.SwitchToFrame(frameSelector), point);
        }

        public void WaitForHorizonIsStable()
        {
            _driver.WaitForHorizonIsStable();
        }

        public void WaitForDotsLoader()
        {
            _driver.WaitForDotsLoader();
        }

        public void WaitForProgressBarToDisappear()
        {
            _driver.WaitForProgressBarToDisappear();
        }

        public void SwitchToTab(string partialUrl)
        {
            _driver.SwitchToWindow(partialUrl);
        }


        public bool CheckElementExists(string cssSelector)
        {
            return _driver.CheckElementExists(cssSelector);
        }

        public void SwitchToDefaultContent()
        {
            _driver.SwitchTo().DefaultContent();
        }

        public void ExecuteJavaScript(string script)
        {
            _driver.ExecuteJavaScript(script);
        }

        public T ExecuteJavaScript<T>(string script)
        {
            return _driver.ExecuteJavaScript<T>(script);
        }

        public IWebDriver Refresh()
        {
            _driver.Navigate().Refresh();
            return _driver;
        }

        public void PressKey(string key)
        {
            _driver.PressKeySelenium(key);
        }
    }
}
