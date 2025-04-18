// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using Newtonsoft.Json;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Security;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.BuildHorizonPageExtenders
{
    public class AddHostVerificationTokenTests
    {
        [Theory, AutoNData]
        internal void Process_ShouldSkipWhenContextItemIsNull(
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] ISitecoreContext sitecoreContext,
            AddHostVerificationToken sut)
        {
            // arrange
            sitecoreContext.Configure().Item.ReturnsNull();
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);

            var args = BuildHorizonPageExtendersArgs.Create();

            // act
            sut.Process(ref args);

            // assert
            args.BodyContent.Length.Should().Be(0);
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Edit, true)]
        [InlineAutoNData(HeadlessMode.Preview, false)]
        [InlineAutoNData(HeadlessMode.Disabled, false)]
        [InlineAutoNData(HeadlessMode.Api, false)]
        internal void Process_ShouldRenderVerificationTokenOnlyForEditMode(
            HeadlessMode headlessMode,
            bool shouldWriteToken,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHostVerificationTokenHelper tokenHelper,
            [Frozen] ICanvasMessageFactory canvasMessageFactory,
            AddHostVerificationToken sut,
            string hostVerificationToken)
        {
            // arrange
            var verificationToken = new HostVerificationModel
            {
                HostVerificationToken = hostVerificationToken
            };

            var verificationTokenMessage = new CanvasMessage<HostVerificationModel>(CanvasMessageType.HostVerificationToken, verificationToken);

            tokenHelper.BuildHostVerificationToken().Returns(hostVerificationToken);
            horizonContext.GetHeadlessMode().Returns(headlessMode);
            canvasMessageFactory.CreateHostVerificationTokenMessage(Arg.Any<HostVerificationModel>()).Returns(verificationTokenMessage);

            var args = BuildHorizonPageExtendersArgs.Create();

            // act
            sut.Process(ref args);

            // assert
            if (shouldWriteToken)
            {
                args.BodyContent.ToString().Should().Contain(JsonConvert.SerializeObject(verificationTokenMessage));
            }
            else
            {
                args.BodyContent.Length.Should().Be(0);
            }
        }
    }
}
