// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using Sitecore.Collections;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites;
using Sitecore.Sites.Headless;
using Sitecore.Web;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.ResolveHorizonMode
{
    public class IgnoreInternalSiteTests
    {
        [Theory]
        [AutoNData]
        internal void ShouldDisableHorizonForRequestWhenSiteIsInternal(
            [Frozen] ISitecoreContext sitecoreContext,
            IgnoreInternalSite sut,
            HttpContextBase httpContext)
        {
            // arrange
            var systemSite = new SiteInfo(new StringDictionary
            {
                ["name"] = "foo",
                ["isInternal"] = "true"
            });
            var args = ResolveHorizonModeArgs.Create(httpContext, new SiteContext(systemSite));

            args.SetResult(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Edit)));

            // act
            sut.Process(ref args);

            // assert
            args.Result.Should().BeEquivalentTo(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled)));
        }

        [Theory]
        [AutoNData]
        internal void ShouldIgnoreRegularSite(
            [Frozen] ISitecoreContext sitecoreContext,
            IgnoreInternalSite sut,
            HttpContextBase httpContext)
        {
            // arrange
            var systemSite = new SiteInfo(new StringDictionary
            {
                ["name"] = "foo",
            });
            var args = ResolveHorizonModeArgs.Create(httpContext, new SiteContext(systemSite));

            args.SetResult(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Edit)));

            // act
            sut.Process(ref args);

            // assert
            args.Result.Parameters.Mode.Should().Be(HeadlessMode.Edit);
        }
    }
}
