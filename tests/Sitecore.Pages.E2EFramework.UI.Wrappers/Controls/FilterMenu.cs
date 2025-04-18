// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

public class FilterMenu : BaseControl
{
    public FilterMenu(IWebElement container) : base(container)
    {
    }

    public enum Options
    {
        All,
        Pages,
        Folders,
        External,
        AdvancedLinkList,
        LinkList
    }

    public Options CheckedOption => Enum.Parse<Options>(_checkedOption);
    public string Title => Container.FindElement(".title").Text;
    public string DescriptionText => Container.FindElement("span:first-of-type").Text;

    private List<IWebElement> Items
    {
        get
        {
            const string cssLocator = "ng-spd-checkbox";
            Container
                .WaitForCondition(c => c.FindElements(cssLocator)
                    .All(b => b.Text != null));
            return Container.FindElements(cssLocator).ToList();
        }
    }

    private string _checkedOption => Items.First(i => i.GetClassList().Contains("checked")).Text;

    public void Close()
    {
        Container.ClickOutside(x:200);
    }

    public string? GetOptionText(Options option)
    {
        return option switch
        {
            Options.All => "All",
            Options.Pages => "Pages",
            Options.Folders => "Folders",
            Options.External=> "External",
            Options.AdvancedLinkList=> "Advanced link list",
            Options.LinkList=>"Link list",
            _ => null
        };
    }

    public void SelectOption(Options option)
    {
        var buttonText = GetOptionText(option);
        Items.First(element => element.Text.Equals(buttonText)).Click();
    }
}
