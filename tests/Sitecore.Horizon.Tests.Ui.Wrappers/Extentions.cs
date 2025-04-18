// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Drawing;
using System.Linq;
using System.Reflection;
using System.Threading;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers
{
    public static class Extensions
    {
        public static void WaitForCondition<T>(this T obj, Func<T, bool> condition)
        {
            WaitForCondition(obj, condition, Context.Settings.ShortWaitTimeout);
        }

        public static void WaitForCondition<T>(this T obj, Func<T, bool> condition, int millisecondsTimeout,
            int pollInterval = 200, bool failOnFalse = false, string message = null)
        {
            UTF.Extensions.WaitForCondition(obj, condition, millisecondsTimeout, pollInterval, failOnFalse, message);
        }

        public static void WaitForDialog(this UtfWebDriver driver)
        {
            driver.WaitForCondition(c => driver.CheckElementExists(".spd-dialog-overlay-panel"), 1000);
        }

        public static void WaitForContextMenu(this UtfWebDriver driver)
        {
            driver.WaitForCondition(c => driver.CheckElementExists(".cdk-overlay-pane"), 1000, 500, false, "Waiting for context menu...");
        }

        public static void WaitForDotsLoader(this UtfWebDriver driver)
        {
            bool elementExists = driver.CheckElementExists(".loading .dots");
            if (elementExists)
            {
                driver.WaitForCondition(d =>
                {
                    var loaderVisible = driver.CheckElementExists(".loading .dots");
                    Logger.WriteLine($"Loader visible...: {loaderVisible}");
                    return !loaderVisible;
                });
            }
        }

        public static void WaitForDotsLoaderOnElement(this WebElement element)
        {
            bool elementExists = element.CheckElementExists(".loading .dots");
            if (elementExists)
            {
                element.WaitForCondition(d =>
                {
                    var loaderVisible = element.CheckElementExists(".loading .dots");
                    Logger.WriteLine($"Loader visible...: {loaderVisible}");
                    return !loaderVisible;
                });
            }
        }

        public static void WaitForHorizonIsStable(this UtfWebDriver driver)
        {
            string iframeSelector = string.Empty;
            bool driverIsInsideCanvasIframe = (bool)driver.ExecuteJavaScript("return window.self !== window.top");

            if (driverIsInsideCanvasIframe)
            {
               // if (driver.Url.Contains("editor"))
               // {
                    iframeSelector = Constants.EditorCanvasCssSelector;
               // }

                //wait for message being picked up from messaging
                Thread.Sleep(50);
                driver.SwitchToRootDocument();
            }

            // Do not use `driver.WaitForAngular()` here, as it does not guarantee that we wait for all the extensions present on the page.
            // Instead use testability provided by Page Composer, so we wait for all the extensions which registered themselves in Page Composer Testability.
            driver.WaitForCondition(
                d => true.Equals(d.ExecuteJavaScript("return window.getAllNgGlobalTestabilities ? window.getAllNgGlobalTestabilities().every(t => t.isStable()) : true")),
                Context.Settings.AjaxWaitTimeout,
                10);

            if (driverIsInsideCanvasIframe)
            {
                //try catch is used because sometimes new iframe is created
                try
                {
                    driver.SwitchToFrame(driver.FindElement(iframeSelector));
                }
                catch
                {
                    Thread.Sleep(300);
                    driver.SwitchToFrame(driver.FindElement(iframeSelector));
                }
            }
        }

        public static void WaitForNetworkCalls(this UtfWebDriver driver)
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

        public static void PressKeyJS(this WebElement webElement, string keyboardEvent, string key)
        {
            string script = $"window['{webElement.Id}'].dispatchEvent(new KeyboardEvent('{keyboardEvent}', {{ key: '{key}' }}));";
            webElement.Driver.ExecuteJavaScript(script);
        }

        public static void DragAndDropToCanvas(this WebElement webElement, Point dropPointInDocument)
        {
            string script = $@"var element = window[""{webElement.Id}""];
            element.dispatchEvent(new DragEvent('dragstart'))
            var overlay = document.querySelector('.designing-page-overlay');
            overlay.dispatchEvent(new DragEvent('dragenter'))
            overlay.dispatchEvent(new DragEvent('dragover', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}) )
            overlay.dispatchEvent(new DragEvent('drop', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}))
            element.dispatchEvent(new DragEvent('dragend'))";
            webElement.Driver.ExecuteJavaScript(script);
        }

        public static void DragAndDropWithinCanvas(this WebElement webElement, Point dropPointInDocument)
        {
            string script = $@"var element = window[""{webElement.Id}""];
            element.dispatchEvent(new DragEvent('dragstart'))
            var overlay = document.querySelector(""div[class*='sc-designing-overlay']"");
            overlay.dispatchEvent(new DragEvent('dragenter'))
            overlay.dispatchEvent(new DragEvent('dragover', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}) )
            overlay.dispatchEvent(new DragEvent('drop', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}))
            element.dispatchEvent(new DragEvent('dragend'))";
            webElement.Driver.ExecuteJavaScript(script);
        }

        public static void DragAndMoveToCanvas(this WebElement webElement, Point dropPointInDocument)
        {
            string script = $@"var element = window[""{webElement.Id}""];
            element.dispatchEvent(new DragEvent('dragstart'))
            var overlay = document.querySelector('.designing-page-overlay');
            overlay.dispatchEvent(new DragEvent('dragenter'))
            overlay.dispatchEvent(new DragEvent('dragover', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}) )";
            webElement.Driver.ExecuteJavaScript(script);
        }

        public static void MoveAndDropToCanvas(this WebElement webElement, Point dropPointInDocument)
        {
            string script = $@"var element = window[""{webElement.Id}""];
            var overlay = document.querySelector('.designing-page-overlay');
            overlay.dispatchEvent(new DragEvent('dragover', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}) )
            overlay.dispatchEvent(new DragEvent('drop', {{ clientX:{dropPointInDocument.X}, clientY:{dropPointInDocument.Y} }}))
            element.dispatchEvent(new DragEvent('dragend'))";
            webElement.Driver.ExecuteJavaScript(script);
        }

        public static void DragAndDrop(this WebElement sourceWebElement, WebElement targetWebElement)
        {
            (int xOffset, int yOffset) offset = GetDefaultDropPointOffset(targetWebElement);
            DragAndDrop(sourceWebElement, targetWebElement, offset.xOffset, offset.yOffset);
        }

        public static void DragAndDrop(this WebElement sourceWebElement, WebElement targetWebElement,
            int dropPointXOffsetInPxs, int dropPointYOffsetInPxs)
        {
            string script = $@"var dragElement = window[""{sourceWebElement.Id}""];
            var dropElement = window[""{targetWebElement.Id}""];
            var dragEvent = new DragEvent('dragstart',{{dataTransfer: new DataTransfer()}});
            dragElement.dispatchEvent(dragEvent)
            var rect = dropElement.getBoundingClientRect();
            var dragenterEvent = new DragEvent('dragenter');
            dropElement.dispatchEvent(dragenterEvent);
            var dropEvent = new DragEvent('drop',{{dataTransfer: dragEvent.dataTransfer,
            clientX: rect.x + {dropPointXOffsetInPxs}, clientY: rect.y + {dropPointYOffsetInPxs}}});
            dropElement.dispatchEvent(dropEvent)
            var dropEndEvent = new DragEvent('dragend',{{dataTransfer: dragEvent.dataTransfer}});
            dragElement.dispatchEvent(dropEndEvent)";
            sourceWebElement.Driver.ExecuteJavaScript(script);
            sourceWebElement.Driver.WaitForHorizonIsStable();
        }

        public static void DragAndMove(this WebElement sourceWebElement, WebElement targetWebElement)
        {
            (int xOffset, int yOffset) offset = GetDefaultDropPointOffset(targetWebElement);
            DragAndMove(sourceWebElement, targetWebElement, offset.xOffset, offset.yOffset);
        }

        public static void ClickAtNotCenter(this UtfWebDriver driver, string cssSelector)
        {
            IWebDriver _driver = driver.GetFieldValue<IWebDriver>("_driver");
            Actions builder = new(_driver);
            var element = _driver.FindElement(By.CssSelector(cssSelector));
            builder.MoveToElement(element, driver.FindElement(cssSelector).GetElementRectangle().Width / 4, 0).Build().Perform();
            builder.Click().Build().Perform();
        }

        public static void DragAndMove(this WebElement sourceWebElement, WebElement targetWebElement,
            int dropPointXOffsetInPxs, int dropPointYOffsetInPxs)
        {
            string script = $@"var dragElement = window[""{sourceWebElement.Id}""];
            var dropElement = window[""{targetWebElement.Id}""];
            window.dragEvent = new DragEvent('dragstart',{{dataTransfer: new DataTransfer()}});
            dragElement.dispatchEvent(window.dragEvent)
            var rect = dropElement.getBoundingClientRect();
            var dragenterEvent = new DragEvent('dragenter');
            dropElement.dispatchEvent(dragenterEvent);
            var dragOverEvent = new DragEvent('dragover',{{dataTransfer: window.dragEvent.dataTransfer,
            clientX: rect.x + {dropPointXOffsetInPxs}, clientY: rect.y + {dropPointYOffsetInPxs} }});
            dropElement.dispatchEvent(dragOverEvent)";
            sourceWebElement.Driver.ExecuteJavaScript(script);
            sourceWebElement.Driver.WaitForHorizonIsStable();
        }

        public static void MoveAndDrop(this WebElement sourceWebElement, WebElement targetWebElement)
        {
            (int xOffset, int yOffset) offset = GetDefaultDropPointOffset(targetWebElement);
            MoveAndDrop(sourceWebElement, targetWebElement, offset.xOffset, offset.yOffset);
        }

        public static void MoveAndDrop(this WebElement sourceWebElement, WebElement targetWebElement,
            int dropPointXOffsetInPxs, int dropPointYOffsetInPxs)
        {
            string script = $@"var dragElement = window[""{sourceWebElement.Id}""];
            var dropElement = window[""{targetWebElement.Id}""];
            var dragenterEvent = new DragEvent('dragenter');
            dropElement.dispatchEvent(dragenterEvent);
            var rect = dropElement.getBoundingClientRect();
            var dragOverEvent = new DragEvent('dragover',{{dataTransfer: window.dragEvent.dataTransfer,
            clientX: rect.x + {dropPointXOffsetInPxs}, clientY: rect.y + {dropPointYOffsetInPxs} }});
            dropElement.dispatchEvent(dragOverEvent)
            var dropEvent = new DragEvent('drop',{{dataTransfer: window.dragEvent.dataTransfer,
            clientX: rect.x + {dropPointXOffsetInPxs}, clientY: rect.y + {dropPointYOffsetInPxs} }});
            dropElement.dispatchEvent(dropEvent)
            var dropEndEvent = new DragEvent('dragend',{{dataTransfer: window.dragEvent.dataTransfer}});
            dragElement.dispatchEvent(dropEndEvent)";
            sourceWebElement.Driver.ExecuteJavaScript(script);
            sourceWebElement.Driver.WaitForHorizonIsStable();
        }

        public static void DragAndMoveOver(this WebElement sourceWebElement, WebElement targetWebElement, int hoverTime)
        {
            (int xOffset, int yOffset) offset = GetDefaultDropPointOffset(targetWebElement);
            string script = $@"var dragElement = window[""{sourceWebElement.Id}""];
            var dropElement = window[""{targetWebElement.Id}""];
            window.dragEvent = new DragEvent('dragstart',{{dataTransfer: new DataTransfer()}});
            dragElement.dispatchEvent(window.dragEvent)
            var dragenterEvent = new DragEvent('dragenter');
            dropElement.dispatchEvent(dragenterEvent);
            var dragleaveEvent = new DragEvent('dragleave');
            setTimeout(function(){{ dropElement.dispatchEvent(dragleaveEvent); }}, {hoverTime});";
            sourceWebElement.Driver.ExecuteJavaScript(script);
            sourceWebElement.Driver.WaitForHorizonIsStable();
        }

        public static T GetFieldValue<T>(this object obj, string name)
        {
            // Set the flags so that private and public fields from instances will be found
            BindingFlags bindingFlags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance;
            FieldInfo field = obj.GetType().GetField(name, bindingFlags);
            return (T)field?.GetValue(obj);
        }

        public static void PressKeySelenium(this UtfWebDriver driver, string key)
        {
            IWebDriver _driver = driver.GetFieldValue<IWebDriver>("_driver");
            Actions builder = new(_driver);
            builder.SendKeys(key).Build().Perform();
        }

        public static IAlert WaitAlert(this UtfWebDriver driver, int timeOut)
        {
            IWebDriver _driver = driver.GetFieldValue<IWebDriver>("_driver");
            try
            {
                WebDriverWait wait = new(_driver, TimeSpan.FromSeconds(timeOut));
                wait.Until(drv => IsAlertShown(drv));
                IAlert alert = _driver.SwitchTo().Alert();
                return alert;
            }
            catch (WebDriverTimeoutException)
            {
                return null;
            }
        }

        public static void WaitForCSSAnimation(this WebElement element)
        {
            element.WaitForCondition(x => x.GetClassList().All(c => !c.Contains("ng-animating")));
            element.Driver.WaitForHorizonIsStable();
        }

        public static bool IsActive(this WebElement element)
        {
            return element.GetClassList().Contains("active");
        }

        public static bool IsSelected(this WebElement element)
        {
            return element.GetClassList().Contains("selected");
        }

        private static (int xOffset, int yOffset) GetDefaultDropPointOffset(WebElement webElement)
        {
            Rectangle itemRectangle = webElement.GetElementRectangle();
            int x = itemRectangle.Width / 2;
            int y = itemRectangle.Height / 2;
            return (x, y);
        }

        private static bool IsAlertShown(IWebDriver driver)
        {
            try
            {
                driver.SwitchTo().Alert();
            }
            catch (NoAlertPresentException)
            {
                return false;
            }

            return true;
        }
    }
}
