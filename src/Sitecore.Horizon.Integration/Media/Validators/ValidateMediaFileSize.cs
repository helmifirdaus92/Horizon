// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Media.Models;
using SysConvert = System.Convert;

namespace Sitecore.Horizon.Integration.Media.Validators
{
    internal class ValidateMediaFileSize : IValidateUploadMedia
    {
        private const uint MaxAllowedFileSize = 2147483648; // 2 GB

        public MediaErrorCode ErrorCode { get; set; }

        public bool IsValid(UploadMediaModel uploadMedia)
        {
            if (uploadMedia == null)
            {
                throw new ArgumentNullException(nameof(uploadMedia));
            }

            var fileSize = uploadMedia.Blob?.LongLength;
            switch (fileSize)
            {
                case 0:
                    ErrorCode = MediaErrorCode.EmptyFile;
                    return false;
                case > MaxAllowedFileSize:
                    ErrorCode = MediaErrorCode.FileSizeTooBig;
                    return false;
                default:
                    ErrorCode = MediaErrorCode.None;

                    return true;
            }
        }
    }
}
