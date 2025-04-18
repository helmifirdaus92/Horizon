// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Media.Models;
using Sitecore.Horizon.Integration.Media.Validators;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Media.Validators
{
    public class ValidateMediaFileExtensionTests
    {
        [Theory]
        [InlineAutoNData("jpeg", true, MediaErrorCode.None)]
        [InlineAutoNData("jpg", true, MediaErrorCode.None)]
        [InlineAutoNData("gif", true, MediaErrorCode.None)]
        [InlineAutoNData("png", true, MediaErrorCode.None)]
        [InlineAutoNData("svg", true, MediaErrorCode.None)]
        [InlineAutoNData("bmp", true, MediaErrorCode.None)]
        [InlineAutoNData("ico", true, MediaErrorCode.None)]
        [InlineAutoNData("pdf", false, MediaErrorCode.InvalidExtension)]
        [InlineAutoNData("docx", false, MediaErrorCode.InvalidExtension)]
        [InlineAutoNData("", false, MediaErrorCode.InvalidExtension)]
        internal void IsValid_ShouldValidateExtensions(string extension, bool isValid, MediaErrorCode code, ValidateMediaFileExtension sut, UploadMediaModel uploadMedia)
        {
            // arrange
            uploadMedia.Extension = extension;

            // act
            var result = sut.IsValid(uploadMedia);

            // assert
            result.Should().Be(isValid);
            sut.ErrorCode.Should().Be(code);
        }
    }
}
