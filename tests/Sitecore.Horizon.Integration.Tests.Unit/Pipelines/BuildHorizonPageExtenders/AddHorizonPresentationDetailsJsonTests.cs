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
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.BuildHorizonPageExtenders
{
    public class AddHorizonPresentationDetailsJsonTests
    {
        [Theory, AutoNData]
        internal void Process_ShouldSkipWhenContextItemIsNull(
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] ISitecoreContext sitecoreContext,
            AddHorizonPresentationDetailsJson sut)
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
        internal void Process_ShouldWritePresentationDetailsJsonOnlyForEditMode(
            HeadlessMode mode,
            bool shouldWrite,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IPresentationDetailsRepository presentationDetailRepository,
            [Frozen] ICanvasMessageFactory canvasMessageFactory,
            AddHorizonPresentationDetailsJson sut,
            [Frozen] PresentationDetails presentationDetails,
            CanvasMessage<PresentationDetails> presentationDetailMessage)
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(mode);

            presentationDetailRepository.GetItemPresentationDetails(Any.Item).Returns(presentationDetails);
            canvasMessageFactory.CreatePresentationDetailsMessage(presentationDetails).Returns(presentationDetailMessage);

            var args = BuildHorizonPageExtendersArgs.Create();

            // act
            sut.Process(ref args);

            // assert
            if (shouldWrite)
            {
                args.BodyContent.ToString().Should().Contain(JsonConvert.SerializeObject(presentationDetails));
            }
            else
            {
                args.BodyContent.Length.Should().Be(0);
            }
        }
    }
}
