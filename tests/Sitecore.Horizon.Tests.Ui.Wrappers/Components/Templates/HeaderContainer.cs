// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;

public class HeaderContainer
{
    private readonly WebElement _headerContainer;

    public HeaderContainer(WebElement headerContainer)
    {
        _headerContainer= headerContainer;
    }

    public WebElement ctaButton => _headerContainer.FindElement(".sub-header button");
}
