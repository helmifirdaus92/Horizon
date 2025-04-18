// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.Links.UrlBuilders;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class MediaItemGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(MediaItemGraphType sut, MediaItem item)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("id", item.ID, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("displayName", item.DisplayName, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("path", item.MediaPath, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("parentId", item.InnerItem.ParentID, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("size", item.Size, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("mimeType", item.MimeType, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ReadIntProperty_ShouldReturnWidthField(MediaItemGraphType sut, MediaItem item, int width)
        {
            // arrange
            item.InnerItem["Width"] = width.ToString();

            // act & assert
            sut.Should().ResolveFieldValueTo("width", width, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ReadIntProperty_ShouldReturnNullValueForTheWidthField_WhenValueCanNotBeParsed(MediaItemGraphType sut, MediaItem item, string nonNumberString)
        {
            // arrange
            item.InnerItem["Width"] = nonNumberString;

            // act & assert
            sut.Should().ResolveFieldValueTo("width", null, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ReadIntProperty_ShouldReturnHeightField(MediaItemGraphType sut, MediaItem item, int width)
        {
            // arrange
            item.InnerItem["Height"] = width.ToString();

            // act & assert
            sut.Should().ResolveFieldValueTo("height", width, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldReturnUrlBuildByMediaManager([Frozen] BaseMediaManager mediaManager, MediaItemGraphType sut, MediaItem item, string mediaUrl)
        {
            //arrange
            mediaManager.GetMediaUrl(item, Any.Arg<MediaUrlBuilderOptions>()).Returns(mediaUrl);

            // act & assert
            sut.Should().ResolveFieldValueTo("url", mediaUrl, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldReturnEmbedUrlBuildByMediaManager([Frozen] BaseMediaManager mediaManager, MediaItemGraphType sut, MediaItem item, string mediaUrl, int expanse)
        {
            // arrange
            item.InnerItem["Height"] = expanse.ToString();
            item.InnerItem["Width"] = expanse.ToString();
            mediaManager.GetMediaUrl(item, Any.Arg<MediaUrlBuilderOptions>()).Returns(mediaUrl);

            // act & assert
            sut.Should().ResolveFieldValueTo("embedUrl", mediaUrl, c => c.WithSource(item));
        }

        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void ShouldReturnHasStreamFromMediaManager(bool hasStream, [Frozen] BaseMediaManager mediaManager, MediaItemGraphType sut, MediaItem item)
        {
            // arrange
            mediaManager.HasMediaContent(item.InnerItem).Returns(hasStream);

            // act & assert
            sut.Should().ResolveFieldValueTo("hasMediaStream", hasStream, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldReturnAltValue(MediaItemGraphType sut, MediaItem item, string alt)
        {
            // arrange
            item.Alt.Returns(alt);

            // act & assert
            sut.Should().ResolveFieldValueTo("alt", alt, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldReturnNullAltValue(MediaItemGraphType sut, MediaItem item)
        {
            //arrange
            item.Alt.Returns("");

            // act & assert
            sut.Should().ResolveFieldValueTo("alt", null, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldReturnDimensionsValue(MediaItemGraphType sut, MediaItem item, string dimensions)
        {
            // arrange
            item.InnerItem.AsFake().WithField("Dimensions", dimensions);

            // act & assert
            sut.Should().ResolveFieldValueTo("dimensions", dimensions, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldReturnNullDimensionsValue(MediaItemGraphType sut, MediaItem item)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("dimensions", null, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldReturnExtensionValue(MediaItemGraphType sut, MediaItem item, string extension)
        {
            // arrange
            item.Extension.Returns(extension);

            // act & assert
            sut.Should().ResolveFieldValueTo("extension", extension, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldReturnNullExtensionValue(MediaItemGraphType sut, MediaItem item)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("extension", null, c => c.WithSource(item));
        }
    }
}
