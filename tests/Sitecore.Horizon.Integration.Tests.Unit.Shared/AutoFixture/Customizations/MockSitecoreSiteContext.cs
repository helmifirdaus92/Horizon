// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using NSubstitute;
using Sitecore.Collections;
using Sitecore.Sites;
using Sitecore.Web;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class MockSitecoreSiteContext : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                var site = Substitute.For<SiteContext>(new SiteInfo(new StringDictionary()), false);

                site.LoginPage.Returns(fixture.Create<string>());
                site.Request.Returns(Substitute.For<SiteRequest>(site));
                site.Response.Returns(Substitute.For<SiteResponse>(site));

                return site;
            });
        }
    }
}
