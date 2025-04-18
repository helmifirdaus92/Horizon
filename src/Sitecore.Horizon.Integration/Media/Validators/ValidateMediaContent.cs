// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using System.Drawing;
using System.IO;
using System.Linq;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Media.Models;

namespace Sitecore.Horizon.Integration.Media.Validators
{
    internal class ValidateMediaContent : IValidateUploadMedia
    {
        private static readonly byte[][] s_svg_signatures = {
                new byte[] { 0x3C, 0x73, 0x76, 0x67 }, // "<svg"
                new byte[] { 0x3C, 0x53, 0x56, 0x47 }, // "<SVG"
                new byte[] { 0x3C, 0x3F, 0x78, 0x6D, 0x6C }, // "<?xml"
                new byte[] { 0x3C, 0x3F, 0x58, 0x4D, 0x4C } // "<?XML"
        };

        private static readonly byte[] webpRiffSignature = { 0x52, 0x49, 0x46, 0x46 }; // "RIFF"
        private static readonly byte[] webpWebpTypeSignature = { 0x57, 0x45, 0x42, 0x50 }; // "WEBP"


        public MediaErrorCode ErrorCode { get; set; }

        private delegate bool IsValidContent(byte[] imageBlob);

        public bool IsValid(UploadMediaModel uploadMedia)
        {
            if (uploadMedia == null)
            {
                throw new ArgumentNullException(nameof(uploadMedia));
            }

            IsValidContent isValidContent = uploadMedia.Extension.ToUpperInvariant() switch
            {
                "SVG" => IsValidSvg,
                "WEBP" => IsValidWebP,
                _ => IsValidImage
            };

            bool isValid = isValidContent(uploadMedia.Blob);

            ErrorCode = isValid ? MediaErrorCode.None : MediaErrorCode.NotAMedia;

            return isValid;
        }

        [SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Justification = "if file is not valid image, catch exception and return false")]
        private bool IsValidImage(byte[] imageBlob)
        {
            using var stream = new MemoryStream(imageBlob);
            try
            {
                Image.FromStream(stream);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private bool IsValidWebP(byte[] imageBlob)
        {
            return imageBlob.Length >= 12 && StartsWith(imageBlob, webpRiffSignature, 0) && StartsWith(imageBlob, webpWebpTypeSignature, 8);
        }

        private bool IsValidSvg(byte[] imageBlob)
        {
            return s_svg_signatures.Any(svgSignature => StartsWith(imageBlob, svgSignature));
        }

        private static bool StartsWith(byte[] array, byte[] signature, int offset = 0)
        {
            if (array.Length < signature.Length + offset)
            {
                return false;
            }

            for (int index = 0; index < signature.Length; index++)
            {
                if (array[index + offset] != signature[index])
                {
                    return false;
                }
            }
            return true;
        }
    }
}
