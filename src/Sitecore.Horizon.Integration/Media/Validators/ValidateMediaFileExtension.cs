// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Media.Models;

namespace Sitecore.Horizon.Integration.Media.Validators
{
    internal class ValidateMediaFileExtension : IValidateUploadMedia
    {
        private readonly string[] _allowedImageTypes =
        {
            "jpeg",
            "jpg",
            "gif",
            "png",
            "svg",
            "bmp",
            "ico",
            "webp"
        };

        public MediaErrorCode ErrorCode { get; set; }

        public bool IsValid(UploadMediaModel uploadMedia)
        {
            if (uploadMedia == null)
            {
                throw new ArgumentNullException(nameof(uploadMedia));
            }

            bool isValidExtension = !string.IsNullOrEmpty(uploadMedia.Extension) &&
                _allowedImageTypes.Any(e => e.Equals(uploadMedia.Extension, StringComparison.OrdinalIgnoreCase));

            ErrorCode = isValidExtension ? MediaErrorCode.None : MediaErrorCode.InvalidExtension;

            return isValidExtension;
        }
    }
}
