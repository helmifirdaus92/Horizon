// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout
{
    public class ContentEditable : CanvasField
    {
        const int ChromeAdditionalWidth = 10;
        public ContentEditable(IWebElement container) : base(container)
        {
        }

        public new string Text
        {
            get => Container.Text;
            set
            {
                Container.Click();
                Container.SendKeys(value);
                Thread.Sleep(100);
            }
        }

        public void ClearAndSet(string value)
        {
            Clear();
            Container.ClickOutside();
            Text = value;
        }

        public void AppendText(string textToAppend)
        {
            SetSelection(Text,true,false);
            Container.SendKeys(textToAppend);
        }

        public override bool IsValidFrameRectangle(Rectangle highlightRectangle)
        {
            Rectangle rect = highlightRectangle;

            rect.Width -= ChromeAdditionalWidth;
            return IsValidFieldHighlight(rect);
        }

        public void SetSelection(string text, bool setCaret = false, bool caretBeforeText = false)
        {
            if (Text.Contains(text))
            {
                var script = $@"var node = arguments[0];
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
                Container.GetDriver().ExecuteJavaScript(script, Container);
                Container.GetDriver().WaitForHorizonIsStable();
            }
            else
            {
                Logger.Write($"Can't set selection. Text '{text}' is missed in the field. Current its value is: '{Text}'");
                throw new Exception();
            }
        }
    }
}
