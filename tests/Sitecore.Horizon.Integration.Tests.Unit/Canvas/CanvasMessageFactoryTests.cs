// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.IO;
using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Canvas
{
    public class CanvasMessageFactoryTests
    {
        [Theory, AutoNData]
        internal void CreateStateMessage_ShouldBuildStateFromSitecoreContext(
            [Frozen] ISitecoreContext sitecoreContext,
            CanvasMessageFactory sut,
            string variant)
        {
            // arrange
            string urlWithVariantQueryStringParam = $"sc_variant={variant}";

            HttpContext.Current =
                new HttpContext(new HttpRequest(string.Empty, "http://url/", urlWithVariantQueryStringParam),
                    new HttpResponse(new StringWriter()));

            // act
            CanvasMessage<CanvasState> canvasMessage = sut.CreateStateMessage();

            // assert
            canvasMessage.Type.Should().Be(CanvasMessageType.State);
            canvasMessage.Data.Should().NotBeNull();
            canvasMessage.Data.ItemId.Should().Be(sitecoreContext.Item?.ID);
            canvasMessage.Data.ItemVersion.Should().Be(sitecoreContext.Item?.Version.Number);
            canvasMessage.Data.SiteName.Should().Be(sitecoreContext.Site?.Name);
            canvasMessage.Data.Language.Should().Be(sitecoreContext.Language.Name);
            canvasMessage.Data.PageMode.Should().BeEquivalentTo(sitecoreContext.Site.DisplayMode.ToString());
            canvasMessage.Data.DeviceId.Should().Be(sitecoreContext.Device.ID);
            canvasMessage.Data.Variant.Should().Be(variant);
        }

        [Theory, AutoNData]
        internal void CreateStateMessage_ShouldReturnUnknownPageModeIfSiteIsNull([Frozen] ISitecoreContext sitecoreContext, CanvasMessageFactory sut)
        {
            // arrange
            sitecoreContext.Configure().Site.ReturnsNull();

            // act
            var result = sut.CreateStateMessage();

            // assert
            result.Data.PageMode.Should().Be("UNKNOWN");
        }

        [Theory, AutoNData]
        internal void CreatePresentationDetailsMessage_ShouldBuildPresentationDetailsMessage(
            CanvasMessageFactory sut,
            PresentationDetails presentationDetails
        )
        {
            // act
            CanvasMessage<PresentationDetails> presentationDetailsMessage = sut.CreatePresentationDetailsMessage(presentationDetails);

            // assert
            presentationDetailsMessage.Type.Should().Be(CanvasMessageType.Layout);
            presentationDetailsMessage.Data.Should().NotBeNull();
            presentationDetailsMessage.Data.Should().BeEquivalentTo(presentationDetails);
        }
    }
}
