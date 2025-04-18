// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.ResolveHorizonMode
{
    public class DisableHorizonForExperienceApplicationsTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldDisablePersistentlyWhenEditModeExplicitlyEnabled(
            DisableHorizonForExperienceApplications sut,
            ResolveHorizonModeArgs args)
        {
            // arrange
            args.HttpContext.Request.QueryString["sc_mode"] = "edit";

            // act
            sut.Process(ref args);

            // assert
            args.Result.Should().BeEquivalentTo(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled)));
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldDisablePersistentlyWhenPreviewModeExplicitlyEnabled(
            DisableHorizonForExperienceApplications sut,
            ResolveHorizonModeArgs args)
        {
            // arrange
            args.HttpContext.Request.QueryString["sc_mode"] = "preview";

            // act
            sut.Process(ref args);

            // assert
            args.Result.Should().BeEquivalentTo(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled)));
        }
    }
}
