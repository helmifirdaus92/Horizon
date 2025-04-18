// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class RTEditorControls : BaseControl
{
    public RTEditorControls(IWebElement container) : base(container)
    {
    }

    public enum Controls
    {
        Bold,
        Italic,
        Underline,
        Link,
        SelectMedia,
        GoToParent,
        Insert,
        InternalLink,
        PhoneNumber
    }

    public string GetSelector(Controls control)
    {
        string toolTipValue = control switch
        {
            Controls.Bold => "Bold",
            Controls.Italic => "Italic",
            Controls.Underline => "Underline",
            Controls.Link => "Link",
            Controls.SelectMedia => "Select media",
            Controls.GoToParent => "Select parent element",
            Controls.Insert => "Insert",
            Controls.InternalLink => "Insert internal link",
            Controls.PhoneNumber => "Add phone number",
            _ => ""
        };
        return control == Controls.Insert
            ? $".ck-toolbar__items button[data-cke-tooltip-text='{toolTipValue}']"
            : $".ck-toolbar__items button[data-cke-tooltip-text*='{toolTipValue}']";
    }

    public void SelectControl(Controls control)
    {
        Container.FindElement(GetSelector(control)).Hover();
        Container.FindElement(GetSelector(control)).Click();
    }
}
