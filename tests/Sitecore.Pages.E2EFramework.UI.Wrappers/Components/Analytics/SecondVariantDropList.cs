// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class SecondVariantDropList : DropList
{
    private readonly IWebElement _secondVariantButton;
    private readonly IWebElement _dropList;

    public SecondVariantDropList(IWebElement secondVariantButton, IWebElement dropList) : base(dropList)
    {
        _secondVariantButton = secondVariantButton;
        _dropList = dropList;
    }

    public new void SelectDropListItem(string dropListItem)
    {
        string classAttribute = _dropList.GetAttribute("class");
        var classNames = classAttribute.Split(' ');

        if (((IList)classNames).Contains("hidden"))
        {
            _secondVariantButton.Click();
            base.SelectDropListItem(dropListItem);
            Container.GetDriver().WaitForHorizonIsStable();
        }
        else
        {
            base.SelectDropListItem(dropListItem);
            Container.GetDriver().WaitForHorizonIsStable();
        }
    }
}
