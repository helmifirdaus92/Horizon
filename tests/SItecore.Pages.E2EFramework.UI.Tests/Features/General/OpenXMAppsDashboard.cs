// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.General;

public class OpenXMAppsDashboard : BaseFixture
{
    [Test]
    public void CheckXMAppsDashboardLink()
    {
        Preconditions.OpenSXAHeadlessSite();

        string link = Context.Pages.Editor.TopBar.GetLDashboardLink();

        link.Should().Contain("https://xmapps-staging.sitecore-staging.cloud/");
        link.Should().Contain($"tenantName={Context.LocalTenant}");
    }
}
