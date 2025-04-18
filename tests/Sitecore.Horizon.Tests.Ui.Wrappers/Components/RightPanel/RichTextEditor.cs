// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.MediaDialogs.ImagesDialog;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public enum RteFormatting
    {
        Normal,
        Header1,
        Header2,
        Header3,
        Header4,
        Header5,
        Header6,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        BulletList,
        NumberedList,
        AllignLeft,
        AllignCenter,
        AllignRight,
        Justify,
        IncreaseIndent,
        DecreaseIndent
    }

    public class RichTextEditor
    {
        private readonly WebElement _rteControl;
        JsHelper jsObserver;

        private List<RteFormatting> comboboxActions;

        public RichTextEditor(WebElement rteControl)
        {
            _rteControl = rteControl;
            jsObserver = new JsHelper(_rteControl.Driver);
            comboboxActions = new List<RteFormatting>()
            {
                RteFormatting.Normal,
                RteFormatting.Header1,
                RteFormatting.Header2,
                RteFormatting.Header3,
                RteFormatting.Header4,
                RteFormatting.Header5,
                RteFormatting.Header6
            };
        }

        public LinkDetailsPanel OpenLinkDetailsPanel()
        {
            _rteControl.FindElement("button[title='Create or edit hyperlink']").Click();
            _rteControl.Driver.WaitForHorizonIsStable();
            return new LinkDetailsPanel(_rteControl.FindElement("ng-spd-slide-in-panel"));
        }

        public ImagesDialog OpenMediaDialog(bool waitForDialogAppears = true)
        {
            _rteControl.FindElement("button[title='Insert media']").Click();
            _rteControl.Driver.WaitForHorizonIsStable();
            if (waitForDialogAppears)
            {
                return new ImagesDialog(_rteControl.Driver.FindElement("app-media-dialog"));
            }

            return null;
        }

        public bool IsFormattingApplied(RteFormatting formatting)
        {
            string cssSelector;
            if (comboboxActions.Contains(formatting))
            {
                var combobox = new DropDown(_rteControl.FindElement("app-rich-text-editor>select"));
                return combobox.SelectedOption == GetFormattingActionName(formatting);
            }

            if (formatting == RteFormatting.IncreaseIndent)
            {
                // to check if increase indent is applied we should check if decrease indent button is enabled
                cssSelector = GetSelector(RteFormatting.DecreaseIndent);
                var element = _rteControl.FindElement(cssSelector);
                return !element.HasAttribute("disabled");
            }

            if (formatting == RteFormatting.DecreaseIndent)
            {
                //decrease indent is applied if button is disabled
                cssSelector = GetSelector(RteFormatting.DecreaseIndent);
                var element = _rteControl.FindElement(cssSelector);
                return element.HasAttribute("disabled");
            }

            cssSelector = GetSelector(formatting);
            return IsElementSelected(_rteControl.FindElement(cssSelector));
        }

        public void ApplyFormatting(RteFormatting action, bool waitForAutoSave = true)
        {
            if (!comboboxActions.Contains(action))
            {
                var cssSelector = GetSelector(action);
                _rteControl.FindElement(cssSelector).Click();
            }
            else
            {
                var combobox = new DropDown(_rteControl.FindElement("app-rich-text-editor>select"));
                var actionName = GetFormattingActionName(action);

                if (combobox.SelectedOption != actionName)
                {
                    combobox.SelectByText(actionName);
                }
            }

            _rteControl.Driver.WaitForHorizonIsStable();
        }

        public void RemoveFormatting(bool waitForAutoSave = true)
        {
            _rteControl.FindElement("button[aria-label='Remove formatting']").Click();
            _rteControl.Driver.WaitForHorizonIsStable();
        }

        private string GetSelector(RteFormatting action)
        {
            return $"button[aria-label='{GetFormattingActionName(action)}']";
        }

        private string GetFormattingActionName(RteFormatting action)
        {
            string name = null;
            switch (action)
            {
                case RteFormatting.Bold:
                case RteFormatting.Italic:
                case RteFormatting.Underline:
                case RteFormatting.Strikethrough:
                case RteFormatting.Normal:
                case RteFormatting.Justify:
                    name = Enum.GetName(typeof(RteFormatting), action);
                    break;
                case RteFormatting.BulletList:
                    name = "Bullet list";
                    break;
                case RteFormatting.NumberedList:
                    name = "Numbered list";
                    break;
                case RteFormatting.AllignLeft:
                    name = "Align left";
                    break;
                case RteFormatting.AllignCenter:
                    name = "Align center";
                    break;
                case RteFormatting.AllignRight:
                    name = "Align right";
                    break;
                case RteFormatting.IncreaseIndent:
                    name = "Increase indent";
                    break;
                case RteFormatting.DecreaseIndent:
                    name = "Decrease indent";
                    break;
                case RteFormatting.Header1:
                    name = "Header 1";
                    break;
                case RteFormatting.Header2:
                    name = "Header 2";
                    break;
                case RteFormatting.Header3:
                    name = "Header 3";
                    break;
                case RteFormatting.Header4:
                    name = "Header 4";
                    break;
                case RteFormatting.Header5:
                    name = "Header 5";
                    break;
                case RteFormatting.Header6:
                    name = "Header 6";
                    break;
            }

            return name;
        }

        private bool IsElementSelected(WebElement element)
        {
            var classAttribute = element.GetClass();
            return classAttribute.Contains("selected");
        }
    }
}
