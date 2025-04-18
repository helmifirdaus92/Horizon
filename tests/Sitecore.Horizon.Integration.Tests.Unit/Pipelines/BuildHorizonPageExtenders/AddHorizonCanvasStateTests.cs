// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using Newtonsoft.Json;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.BuildHorizonPageExtenders;

public class AddHorizonCanvasStateTests
{
    [Theory]
    [InlineAutoNData(HeadlessMode.Edit, true)]
    [InlineAutoNData(HeadlessMode.Preview, true)]
    [InlineAutoNData(HeadlessMode.Disabled, false)]
    [InlineAutoNData(HeadlessMode.Api, false)]
    internal void Process_ShouldWriteCanvasStateOnlyForEditAndPreviewModes(
        HeadlessMode headlessMode,
        bool shouldWriteCanvasState,
        [Frozen] IHorizonInternalContext horizonContext,
        [Frozen] ICanvasMessageFactory canvasMessageFactory,
        AddHorizonCanvasState sut)
    {
        // arrange
        CanvasMessage<CanvasState> canvasMessage = new CanvasMessage<CanvasState>(CanvasMessageType.State,
            new CanvasState
            {
                ItemId = ID.NewID,
                SiteName = "site"
            });
        canvasMessageFactory.Configure().CreateStateMessage().Returns(canvasMessage);
        BuildHorizonPageExtendersArgs args = BuildHorizonPageExtendersArgs.Create();

        horizonContext.GetHeadlessMode().Returns(headlessMode);

        // act
        sut.Process(ref args);

        // assert
        if (shouldWriteCanvasState)
        {
            args.BodyContent.ToString().Should().Contain(JsonConvert.SerializeObject(canvasMessage));
        }
        else
        {
            args.BodyContent.Length.Should().Be(0);
        }
    }
}
