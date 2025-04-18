// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class InsertOptions : BaseControl
{
    public InsertOptions(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public IWebElement InsertOptionsCheckbox => Container.FindElement("ng-spd-checkbox");
    public IWebElement CloseButton => Container.FindElement(".actions.pt-xl > button");
}
