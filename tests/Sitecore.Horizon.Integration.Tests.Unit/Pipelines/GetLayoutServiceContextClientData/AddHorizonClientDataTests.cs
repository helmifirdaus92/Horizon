// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.GetLayoutServiceContextClientData;
using Sitecore.Horizon.Integration.Security;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.LayoutService.ItemRendering.Pipelines.GetLayoutServiceContextClientData;
using Sitecore.LayoutService.Services;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.GetLayoutServiceContextClientData;

public class AddHorizonClientDataTests
{
    [Theory]
    [AutoNData]
    internal void Process_ShouldAddCanvasStateAndTokenWhenEditModeIsMetaData(
        [Frozen] IEditModeResolver editModeResolver,
        [Frozen] ICanvasMessageFactory canvasMessageFactory,
        [Frozen] IHostVerificationTokenHelper tokenHelper,
        GetLayoutServiceContextClientDataArgs args,
        CanvasState state,
        string token,
        AddHorizonClientData sut)
    {
        // arrange
        editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Metadata);
        canvasMessageFactory.Configure().CreateState().Returns(state);
        tokenHelper.Configure().BuildHostVerificationToken().Returns(token);

        sut.Process(args);

        args.ClientData["hrz-canvas-state"].Should().Be(state);
        args.ClientData["hrz-canvas-verification-token"].Should().Be(token);
    }

    [Theory]
    [AutoNData]
    internal void Process_ShouldNotAddCanvasStateAndTokenWhenNotInMetaDataMode(
        [Frozen] IEditModeResolver editModeResolver,
        [Frozen] ICanvasMessageFactory canvasMessageFactory,
        [Frozen] IHostVerificationTokenHelper tokenHelper,
        GetLayoutServiceContextClientDataArgs args,
        CanvasState state,
        string token,
        AddHorizonClientData sut)
    {
        // arrange
        editModeResolver.ResolveEditMode(Arg.Any<HttpRequestBase>()).Returns(EditMode.Chromes);
        canvasMessageFactory.Configure().CreateState().Returns(state);
        tokenHelper.Configure().BuildHostVerificationToken().Returns(token);

        sut.Process(args);

        args.ClientData.Should().NotContainKey("hrz-canvas-state");
        args.ClientData.Should().NotContainKey("hrz-canvas-verification-token");
    }
}
