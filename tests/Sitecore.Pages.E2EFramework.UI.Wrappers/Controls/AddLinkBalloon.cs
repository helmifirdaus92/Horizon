// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class AddLinkBalloon : BaseControl
{
    public AddLinkBalloon(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public IWebElement OpenInNewTabButton => Container.FindElement("button[class*=\"ck-switchbutton\"]");
    public IWebElement SaveButton => Container.FindElement("button[class=\"ck ck-button ck-off ck-button-save\"]");
    public IWebElement CancelButton => Container.FindElement("button[class=\"ck ck-button ck-off ck-button-cancel\"]");
    public TextBox LinkInput => Container.FindControl<TextBox>("input[id*=\"ck-labeled-field-view\"");
}
