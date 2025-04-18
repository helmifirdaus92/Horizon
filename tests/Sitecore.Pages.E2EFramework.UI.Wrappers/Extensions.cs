// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using System.Drawing;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;

public static class Extensions
{
    public static void WaitForHorizonIsStable(this IWebDriver driver)
    {
        string iframeSelector = string.Empty;
        bool driverIsInsideCanvasIframe = driver.ExecuteJavaScript<bool>("return window.self !== window.top");

        if (driverIsInsideCanvasIframe)
        {
            iframeSelector = "iframe:not([hidden])";

            //wait for message being picked up from messaging
            Thread.Sleep(50);
            driver.SwitchTo().DefaultContent();
        }

        // Do not use `driver.WaitForAngular()` here, as it does not guarantee that we wait for all the extensions present on the page.
        // Instead use testability provided by Page Composer, so we wait for all the extensions which registered themselves in Page Composer Testability.
        driver.WaitForCondition(
            d => true.Equals(d.ExecuteJavaScript<bool>("return window.getAllNgGlobalTestabilities().length >= 1 &&  window.getAllNgGlobalTestabilities().every(t => t.isStable())")),
            Settings.ShortWaitTimeout,
            10);

        if (driverIsInsideCanvasIframe)
        {
            //try catch is used because sometimes new iframe is created
            try
            {
                driver.SwitchToFrame(iframeSelector);
            }
            catch
            {
                Thread.Sleep(300);
                driver.SwitchToFrame(iframeSelector);
            }
        }
    }

    public static bool IsSelected(this IWebElement element)
    {
        return element.GetClassList().Contains("selected");
    }

    public static void WaitForLoaderToDisappear(this IWebDriver driver)
    {
        try
        {
            driver.WaitForCondition(
                d => d.CheckElement(".loader-overlay") == null, Settings.LongWaitTimeout,
                10);
        }
        catch (Exception e)
        {
            Logger.Write(e.Message);
        }
    }

    public static ReadOnlyCollection<IWebElement> GetChildren(
        this IWebElement element, bool waitForAny = true)
    {
        if (waitForAny)
        {
            return element.FindElements(By.XPath("./*"));
        }

        var driver = element.GetDriver();
        var originalWaitTimeout = driver.Manage().Timeouts().ImplicitWait;
        driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(300);
        var childElements = element.FindElements(By.XPath("./*"));
        driver.Manage().Timeouts().ImplicitWait = originalWaitTimeout;

        return childElements;
    }

    public static IWebElement GetNextSibling(this IWebElement element)
    {
        IWebDriver driver = element.GetDriver();
        return driver.ExecuteJavaScript<IWebElement>("return arguments[0].nextElementSibling", (object)element);
    }

    public static IWebElement GetParent(this IWebElement element)
    {
        return element.FindElement(By.XPath("./.."));
    }

    public static void JsClick(this IWebElement element)
    {
        element.GetDriver().ExecuteJavaScript("arguments[0].click()", element);
    }

    public static void HoverAndClick(this IWebElement element)
    {
        element.Hover();
        element.Click();
    }

    public static void ClickOutside(this IWebElement element, int x = 0, int y = -5)
    {
        Actions action = new(element.GetDriver());
        Rectangle rect = element.GetElementRectangle();
        x = x == 0 ? rect.Width / 2 : x;
        action.MoveToElement(element, offsetX: x, offsetY: y).Click().Build().Perform(); // 5 pixels above the element's top edge
        element.GetDriver().WaitForHorizonIsStable();
    }

    public static string Value(this IWebElement ele) => ele.GetDomProperty("value");

    public static ContextMenu GetContextMenuOnButton(this IWebDriver driver, string cssLocator = "")
    {
        cssLocator = cssLocator == "" ? Constants.CdkOverlayContainerCdkOverlayPane : cssLocator;
        driver.WaitForCondition(c => driver.CheckElementExists(cssLocator), TimeSpan.FromMilliseconds(1000), 500, false, "Waiting for context menu...");
        return new ContextMenu(driver.FindElements(cssLocator).Last());
    }

    public static void PressKeySelenium(this IWebDriver driver, string key)
    {
        Actions builder = new Actions(driver);
        builder.SendKeys(key).Build().Perform();
    }

    public static void PressAndHoldKeySelenium(this IWebDriver driver, string key)
    {
        Actions builder = new Actions(driver);
        builder.KeyDown(key);
    }

    public static void WaitForDotsLoader(this IWebDriver driver)
    {
        try
        {
            driver.WaitForCondition(
                d =>
                {
                    Logger.Write("Waiting for Dots loader in view to disappear");
                    return d.CheckElement(".loading .dots") == null;
                }, Settings.ShortWaitTimeout,
                10);
        }
        catch (Exception e)
        {
            Logger.Write(e.Message);
        }
    }

    public static void WaitForProgressBarToDisappear(this IWebDriver driver)
    {
        try
        {
            driver.WaitForCondition(
                d =>
                {
                    Logger.Write("Waiting for Progress bar to disappear");
                    return d.CheckElement(".mat-mdc-progress-spinner") == null;
                }, Settings.ShortWaitTimeout,
                10);
        }
        catch (Exception e)
        {
            Logger.Write(e.Message);
        }
    }

    public static void WaitForDialog(this IWebDriver driver)
    {
        driver.WaitForCondition(c => driver.CheckElementExists(".spd-dialog-overlay-panel"), TimeSpan.FromMilliseconds(1000));
    }

    public static bool CheckElementExists(this IWebDriver driver, string cssSelector)
    {
        var element = driver.CheckElement(cssSelector);
        return element != null;
    }

    public static bool CheckElementExists(this IWebElement element, string cssSelector)
    {
        return CheckElementExists(element.GetDriver(), cssSelector);
    }

    public static void WaitForOverlayPanelToDisappear(this IWebDriver driver)
    {
        driver.WaitForCondition(d => !d.CheckElementExists(Constants.CdkOverlayContainerCdkOverlayPane));
    }

    public static void WaitForNetworkActivity(this IWebDriver driver)
    {
        driver.WaitForCondition(d => (bool)((IJavaScriptExecutor)d).ExecuteScript(@"
                    return (window.performance.getEntriesByType('resource').length == 0);
                "));
    }

    public static void WaitForNetworkCalls(this IWebDriver driver)
    {
        var script = @"const timeoutMillis = 5000; // Adjust this to your desired timeout in milliseconds
                           const apiEndpoint = 'api/authoring/graphql/v1';
                           function waitForNetworkCallsToFinish(timeoutMillis, apiEndpoint) {
                                return new Promise((resolve, reject) => {
                                        const timeout = setTimeout(() => {
                                            reject(new Error('Timeout waiting for network calls to complete'));
                                            }, timeoutMillis);
                                function checkNetworkCalls(apiEndpoint) {
                                        const netWorkCallsCountBefore = window.performance.getEntriesByType('resource')
                                                                            .filter((entry) => entry.name.includes(apiEndpoint)).length;
                                        setTimeout(() => {
                                            const netWorkCallsCountAfter = window.performance.getEntriesByType('resource')
                                                                            .filter((entry) => entry.name.includes(apiEndpoint)).length;
                                            if (netWorkCallsCountAfter === netWorkCallsCountBefore) {
                                                clearTimeout(timeout);
                                                resolve(); // Call resolve to signal successful completion
                                            }
                                            else {
                                                console.log(netWorkCallsCountAfter > netWorkCallsCountBefore);
                                                checkNetworkCalls(apiEndpoint);
                                            }
                                        }, 500)
                                      };
                                checkNetworkCalls(apiEndpoint);
                                });
                            }
                            waitForNetworkCallsToFinish(timeoutMillis, apiEndpoint)
                                .then(() => {
                                        console.log('Network calls have completed.');
                                        // Continue with your Selenium test steps here
                                    })
                                    .catch((error) => {
                                        console.log(error.message);
                                        // Handle the timeout or other errors
                                    });";
        driver.ExecuteJavaScript(script);
    }

    public static void WaitForCssAnimation(this IWebElement element)
    {
        element.WaitForCondition(x => x.GetClassList().All(c => !c.Contains("ng-animating")));
        element.GetDriver().WaitForHorizonIsStable();
    }

    public static void DragAndDropElement(this IWebDriver driver, IWebElement element, IWebElement destinationElement)
    {
        Actions builder = new(driver);
        IAction action = builder.DragAndDrop(element, destinationElement)
            .Build();
        action.Perform();
        driver.WaitForHorizonIsStable();
    }

    public static void DragAndDropElement(this IWebDriver driver, IWebElement element, int offsetX, int offsetY)
    {
        Actions builder = new(driver);
        IAction action = builder
            .ClickAndHold(element)
            .MoveToLocation(offsetX, offsetY)
            .Release()
            .Build();
        action.Perform();
        driver.WaitForHorizonIsStable();
    }

    public static void DragAndMoveElement(this IWebDriver driver, IWebElement element, IWebElement destinationElement)
    {
        Actions builder = new(driver);
        IAction action = builder.DragAndDropToOffset(element, destinationElement.Location.X, destinationElement.Location.Y)
            .Build();
        action.Perform();
        driver.WaitForHorizonIsStable();
    }

    public static void MoveAndDropToCanvas(this IWebElement webElement, Point dropPointInDocument)
    {
        string script = $@"var element = document.querySelector(""{webElement}"");
            var overlay = document.querySelector('.designing-page-overlay');
            overlay.dispatchEvent(new DragEvent('dragover', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}) )
            overlay.dispatchEvent(new DragEvent('drop', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}))
            element.dispatchEvent(new DragEvent('dragend'))";
        webElement.GetDriver().ExecuteJavaScript(script);
    }

    public static void DragAndDropToCanvas(this IWebElement webElement, string cssSelector, Point dropPointInDocument)
    {
        string script = $@"var element = document.querySelector(""{cssSelector}"");
            element.dispatchEvent(new DragEvent('dragstart'))
            var overlay = document.querySelector('.designing-page-overlay');
            overlay.dispatchEvent(new DragEvent('dragenter'))
            overlay.dispatchEvent(new DragEvent('dragover', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}) )
            overlay.dispatchEvent(new DragEvent('drop', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}))
            element.dispatchEvent(new DragEvent('dragend'))";
        webElement.GetDriver().ExecuteJavaScript(script);
    }

    public static void CtrlClick(this IWebElement element)
    {
        Actions builder = new Actions(element.GetDriver());
        builder.KeyDown(Keys.Control).Build().Perform();
        element.Hover();
        element.Click();
        builder.KeyUp(Keys.Control).Build().Perform();
    }

    public static Rectangle GetElementRectangle(this IWebElement element)
    {
        return new Rectangle(element.Location, element.Size);
    }
}
