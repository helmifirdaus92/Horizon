// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Jobs;
using Sitecore.Links;
using Sitecore.Security.Accounts;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonMoveItem
{
    public class RepairLinksTests
    {
        [Theory, AutoNData]
        internal void Process_ShouldStartLinkUpdaterJob(
            [Frozen] ISitecoreContext context,
            [Frozen] BaseJobManager jobManager,
            [NoAutoProperties] RepairLinks sut,
            HorizonMoveItemArgs args,
            string siteName,
            User user)
        {
            // arrange
            context.Site.Name.Returns(siteName);
            context.User.Returns(user);

            jobManager.Start(Any.Capture<DefaultJobOptions>(out var jobOptions));

            // act
            sut.Process(ref args);

            // assert
            jobManager.Received().Start(Any.Arg<BaseJobOptions>());
            jobOptions.Value.SiteName.Should().Be(siteName);
            jobOptions.Value.ContextUser.Should().Be(user);
            jobOptions.Value.Method.Object.Should().BeOfType<LinkUpdaterJob>();
            jobOptions.Value.Method.Method.Name.Should().Be("Update");
        }
    }
}
