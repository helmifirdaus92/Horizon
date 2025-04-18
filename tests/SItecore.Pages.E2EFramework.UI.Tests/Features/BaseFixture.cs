// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using System.Text.RegularExpressions;
using AventStack.ExtentReports;
using NUnit.Framework;
using NUnit.Framework.Interfaces;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features
{
    [TestFixture]
    public class BaseFixture : TestBase
    {
        private List<LogEntry> _browserErrors = new();

        [OneTimeSetUp]
        public void SetUp()
        {
            BeforeSuite(TestContext.CurrentContext.Test.Name);
            Context.ApiHelper = new ApiHelper(Context.CmUrl + "/sitecore");
        }

        [SetUp]
        public void BeforeTest()
        {
            BeforeTest(TestContext.CurrentContext.Test.FullName);
            Context.Browser.StartConsoleErrorCollection();
        }

        [TearDown]
        public virtual void AfterTest()
        {
            var result = TestContext.CurrentContext.Result;
            if (result.Outcome.Status != TestStatus.Passed)
            {
                var absoluteTestName = GetAbsoluteTestName(TestContext.CurrentContext.Test);
                File.WriteAllBytes($"{absoluteTestName}.png", Convert.FromBase64String(TakeScreenshot(Context.Browser.GetDriver())));
                var screenShotPath = Path.GetFullPath($"{absoluteTestName}.png");
                TestContext.AddTestAttachment(screenShotPath);
                Console.WriteLine($"##teamcity[publishArtifacts '{screenShotPath} => /screenshots']");
                Console.WriteLine("--------------Browser errors----------------- ");
                Context.Browser.GetDriver().Manage().Logs.GetLog(LogType.Browser).ToList().ForEach(x => Console.WriteLine(x.Message));
                Console.WriteLine($"##teamcity[testMetadata testName='{TestContext.CurrentContext.Test.FullName}' type='image' value='/screenshots/{Path.GetFileName(screenShotPath)}']");
                RefreshBrowserIfThereAreAnyLeftOverOverlaysInFailedTests();
            }

            AfterTest(result.Message, result.Outcome.Status.ToString(), result.StackTrace);
            Context.ApiHelper.CleanTestDataAsync(keepProtected: true);
            Context.TestItems.Clear(keepProtected: true);
            CloseExtraTabsAndSwitchToPages();
        }

        public new void AfterTest(string testResult, string testStatus, string stackTrace = null)
        {
            ExtentTest test = ExtentTestManager.GetTest();
            string str1 = !string.IsNullOrEmpty(stackTrace) ? "StackTrace: <pre>" + stackTrace + "</pre>" : "";
            MediaEntityModelProvider provider = (MediaEntityModelProvider)null;
            ReadOnlyCollection<string> newBrowserErrors = GetNewBrowserErrors();
            string str2 = newBrowserErrors.Any<string>() ? string.Format("<br>{0} browser errors:<br><br>", (object)newBrowserErrors.Count) + string.Join("<br><br>", (IEnumerable<string>)newBrowserErrors) : "";
            string str3 = testStatus;
            if (!(str3 == "Failed"))
            {
                if (!(str3 == "Inconclusive"))
                {
                    if (str3 == "Skipped")
                    {
                        test.Warning("<b class='text-skip'>Test is ignored</b>");
                    }
                    else
                    {
                        test.Pass("<b class='text-pass'>Test passed</b><br><code>" + str2 + "</code>");
                    }
                }
                else
                {
                    test.Warning("<b class='text-skip'>Test is inconclusive</b>");
                }
            }
            else
            {
                try
                {
                    string screenshot = TakeScreenshot(Context.Browser.GetDriver());
                    GetNewBrowserErrors();
                    provider = MediaEntityBuilder.CreateScreenCaptureFromBase64String(screenshot).Build();
                }
                finally
                {
                    test.Fail("Error: <pre style='color: red !important;'>" + testResult + "</pre>" + str1 + "<br /><code>" + str2 + "</code><br />", provider);
                }
            }
        }

        public new ReadOnlyCollection<string> GetNewBrowserErrors()
        {
            _browserErrors = Context.Browser.GetDriver().GetJsErrors().ToList().Except(_browserErrors).ToList();
            ;
            return _browserErrors.Select(error => string.Format("[{0:T}]: {1}", error.Timestamp.ToLocalTime(), error.Message)).ToList().AsReadOnly();
        }

        public void CloseExtraTabsAndSwitchToPages()
        {
            if (Context.Browser.TabsCount > 1)
            {
                Context.Browser.SwitchToTab(TestRunSettings.StartUrl);
                string mainWindowHandle = Context.Browser.GetDriver().CurrentWindowHandle;
                ReadOnlyCollection<string> windowHandles = Context.Browser.GetDriver().WindowHandles;
                foreach (var windowHandle in windowHandles)
                {
                    if (windowHandle != mainWindowHandle)
                    {
                        Context.Browser.GetDriver().SwitchTo().Window(windowHandle);
                        Context.Browser.GetDriver().CloseCurrentTab();
                    }
                }

                Context.Browser.SwitchToTab(TestRunSettings.StartUrl);
            }
        }

        internal static string GetAbsoluteTestName(TestContext.TestAdapter test)
        {
            string arguments = "";
            if (test.Arguments.Length != 0)
            {
                foreach (var argument in test.Arguments)
                {
                    arguments += '_' + argument.ToString();
                }
            }
            string finalName = Regex.Replace(test.MethodName + arguments, @"[^a-zA-Z0-9\s]", "_");
            return finalName;
        }

        internal void RefreshBrowserIfThereAreAnyLeftOverOverlaysInFailedTests()
        {
            bool isOverlayPresent = Context.Browser.ExecuteJavaScript<bool>("return document.querySelector('.cdk-overlay-container')?.querySelector('.cdk-overlay-backdrop') == undefined");
            if (!isOverlayPresent)
            {
                Console.WriteLine("-------------------Refreshing browser because of Overlays in previous failed test");
                Context.Browser.Refresh();
                var url = Context.Browser.PageUrl;
                if (url.Contains("/editor?") || url.Contains("/personalization?") || url.Contains("/editpartialdesign?") || url.Contains("/editpagedesign?"))
                {
                    Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
                }
            }
        }

        [OneTimeTearDown]
        protected void TearDown()
        {
            Context.ApiHelper.CleanTestData(keepProtected: false);
            Context.TestItems.Clear(keepProtected: false);
            AfterSuite();
            Context.ApiHelper.DisposeApiClients();
        }
    }
}
