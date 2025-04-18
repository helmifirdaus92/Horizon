// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Drawing;
using System.Linq;
using System.Threading;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;
using Keys = OpenQA.Selenium.Keys;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout.CanvasControls
{
    public class CanvasField : CanvasControl
    {
        const int ChromeAdditionalWidth = 10;

        private static string[] KnownInlineFieldTypes = new[]
        {
            "single-line text",
            "multi-line text",
            "rich text",
            "integer",
            "number",
            "date",
            "datetime"
        };

        private readonly JsHelper _domJsObserver;

        public CanvasField(WebElement container) : base(container)
        {
            _domJsObserver = new JsHelper(container.Driver);
        }

        public bool Editable => Container.GetAttribute("contenteditable") == "true";

        public new string Text
        {
            get => Container.Text;
            set
            {
                Clear();
                AppendText(value);
            }
        }

        public CanvasField SetText(string text)
        {
            Click();
            Clear();
            Container.TypeKeys(text);
            Thread.Sleep(100);
            return this;
        }

        public CanvasField SetTextByJs(string text)
        {
            Click();
            Clear();
            Container.Driver.ExecuteJavaScript($"window['{Container.Id}'].innerText = '{text}'");
            Container.Driver.ExecuteJavaScript($"window['{Container.Id}'].dispatchEvent(new InputEvent('input'));");
            Thread.Sleep(100);
            return this;
        }

        public string GetSelectedText()
        {
            var script = "return window.getSelection().toString()";
            return (string)Container.Driver.ExecuteJavaScript(script);
        }

        public void SelectText(string text)
        {
            SetSelection(text);
        }

        public void PutCaret(string text, bool beforeText)
        {
            SetSelection(text, true, beforeText);
        }

        public void PressBackSpaceButton()
        {
            Container.Driver.PressKeySelenium(Keys.Backspace);
            Container.Driver.WaitForHorizonIsStable();
        }

        public void PressEnterButton()
        {
            Container.Driver.PressKeySelenium(Keys.Enter);
            Container.Driver.WaitForHorizonIsStable();
        }

        public void PressDeleteButton()
        {
            Container.Driver.PressKeySelenium(Keys.Delete);
            Container.Driver.WaitForHorizonIsStable();
        }

        public void SetSelection(string text, bool setCaret = false, bool caretBeforeText = false)
        {
            if (Text.Contains(text))
            {
                var script = $@"var node = window['{Container.Id}'];
                    var setSelectionFunc = function(textToSelect, node, setCaret, caretPosition){{
                    let innerText = node.textContent;
                    console.log('The text of element is - ' + innerText);
                    let startSelectionIndex = innerText.indexOf(textToSelect);
                    let stopSelectionIndex = startSelectionIndex + textToSelect.length;
                    console.log('Start selection index is - ' + startSelectionIndex);
                    console.log('Stop selection index is - ' + stopSelectionIndex);

                    let startSelectionNode, startIndexInNode, stopSelectionNode, stopIndexInNode;

                    let iter = document.createNodeIterator (node, NodeFilter.SHOW_TEXT);
                    while(textnode = iter.nextNode()){{
                        if(textnode.textContent.length > startSelectionIndex && !startSelectionNode){{
                            startSelectionNode = textnode;
                            startIndexInNode = startSelectionIndex;
                        }}
                        if(textnode.textContent.length >= stopSelectionIndex && !stopSelectionNode){{
                            stopSelectionNode = textnode;
                            stopIndexInNode = stopSelectionIndex
                        }}
                        startSelectionIndex = startSelectionIndex - textnode.textContent.length;
                        stopSelectionIndex = stopSelectionIndex - textnode.textContent.length

                    }}
                    var range = document.createRange();
                    range.setStart(startSelectionNode, startIndexInNode);
                    range.setEnd(stopSelectionNode, stopIndexInNode);
                    if(setCaret){{
                        range.collapse(caretPosition);
                    }}

                    var selection = window.getSelection()
                    selection.removeAllRanges();
                    selection.addRange(range);
                }}
                setSelectionFunc('{text}', node, {setCaret.ToString().ToLower()}, {caretBeforeText.ToString().ToLower()});";
                Container.Driver.ExecuteJavaScript(script);
                Container.Driver.WaitForHorizonIsStable();
            }
            else
            {
                Logger.WriteLineWithTimestamp($"Can't set selection. Text '{text}' is missed in the field. Current its value is: '{Text}'");
                throw new Exception();
            }
        }

        public CanvasField AppendText(string text)
        {
            Click();
            Container.SendKeys(text);
            Thread.Sleep(100);
            return this;
        }

        public CanvasField SaveChanges()
        {
            Click();
            Container.PressKey(UTF.Keys.S, UTF.Keys.Control);
            Container.Driver.WaitForCondition(c => !c.CheckElementExists(".spd-circular-spinner"), 2000, message: "Save didn't happen in 2Seconds");
            Container.Driver.WaitForHorizonIsStable();
            return this;
        }

        public CanvasField LooseFocus()
        {
            var noMetterRendering = Container.Driver.FindElement("[kind='open'] ~ :not(code)");
            noMetterRendering.Click();
            Container.Driver.WaitForCondition(c => !c.CheckElementExists(".spd-circular-spinner"), 2000, message: "Save didn't happen in 2Seconds");
            Container.Driver.WaitForHorizonIsStable();
            return this;
        }

        public CanvasField Autosave()
        {
            Thread.Sleep(TimeSpan.FromSeconds(3));
            Container.Driver.WaitForHorizonIsStable();
            return this;
        }

        public CanvasField Clear()
        {
            Click();
            Container.Clear();
            Thread.Sleep(100);
            return this;
        }

        public override bool IsValidFrameRectangle(Rectangle highlightRectangle)
        {
            Rectangle rect = highlightRectangle;

            if (KnownInlineFieldTypes.Contains(Container.GetAttribute("scfieldtype"))
                || KnownInlineFieldTypes.Contains(Container.GetParent().GetAttribute("scfieldtype"))) //for RTE field)
            {
                rect.Width -= ChromeAdditionalWidth;
            }

            return IsValidFieldHighlight(rect);
        }

        private bool IsValidFieldHighlight(Rectangle highlightRectangle)
        {
            //highlight border is extended 2 pixels left to have place for caret before first character in field
            int caretVisibilityLeftShift = 2; //2 px
            if (ElementRectangle.X == highlightRectangle.X + caretVisibilityLeftShift && ElementRectangle.Y == highlightRectangle.Y &&
                ElementRectangle.Width == highlightRectangle.Width - caretVisibilityLeftShift)
            {
                return ElementRectangle.Height == highlightRectangle.Height;
            }

            return false;
        }
    }
}
