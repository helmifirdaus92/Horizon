// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web.UI;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Layouts;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Layouts
{
    public class HorizonPageExtenderTests
    {
        [Theory, AutoNData]
        internal void Insert_ShouldInsertContentFromPipelineToPage(
            [Frozen] IHorizonPipelines horizonPipelines,
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] IHorizonInternalContext horizonContext,
            [Greedy] HorizonPageExtender sut,
            string content)
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);
            horizonPipelines.BuildHorizonPageExtenders(ref Any.ArgDo((ref BuildHorizonPageExtendersArgs args) => args.BodyContent.AppendLine(content)));

            // act
            sut.Insert();

            // assert
            sitecoreContext.Page.Renderings.Should().Contain(x => x.GetControl() is LiteralControl && ((LiteralControl)x.GetControl()).Text.Contains(content));
        }

        [Theory, AutoNData]
        internal void Insert_ShouldNotInsertWhenContentIsEmpty(
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] IHorizonInternalContext horizonContext,
            [Greedy] HorizonPageExtender sut)
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);

            // act
            sut.Insert();

            // assert
            sitecoreContext.Page.Renderings.Should().BeEmpty();
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        internal void Insert_ShouldNotInsertWhenHorizonModeIsDisabledOrApi(
            HeadlessMode mode,
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonPipelines horizonPipelines,
            [Greedy] HorizonPageExtender sut,
            string content)
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(mode);
            horizonPipelines.BuildHorizonPageExtenders(ref Any.ArgDo((ref BuildHorizonPageExtendersArgs x) => x.BodyContent.AppendLine(content)));

            // act
            sut.Insert();

            // assert
            sitecoreContext.Page.Renderings.Should().BeEmpty();
        }

        [Theory, AutoNData]
        internal void Insert_ShouldThrowWhenPageIsNull(
            [Frozen] IHorizonPipelines horizonPipelines,
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] IHorizonInternalContext horizonContext,
            [Greedy] HorizonPageExtender sut,
            string content)
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);
            sitecoreContext.Configure().Page.ReturnsNull();

            horizonPipelines.BuildHorizonPageExtenders(ref Any.ArgDo((ref BuildHorizonPageExtendersArgs x) => x.BodyContent.AppendLine(content)));

            // act
            // assert
            sut.Invoking(x => x.Insert()).Should().Throw<InvalidOperationException>().WithMessage("Page context should not be null.");
        }

        [Fact]
        internal void Ctor_ShouldNotThrow()
        {
            // arrange, act, assert
            Invoking.Action(() => new HorizonPageExtender()).Should().NotThrow();
        }
    }
}
