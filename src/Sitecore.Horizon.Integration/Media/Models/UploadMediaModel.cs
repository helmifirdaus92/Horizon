// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Globalization;

namespace Sitecore.Horizon.Integration.Media.Models
{
#nullable disable warnings // It's mapper class
#pragma warning disable CA1819

    internal class UploadMediaModel
    {
        public string FileName { get; set; }

        public string Extension { get; set; }

        public byte[] Blob { get; set; }

        public string MediaId { get; set; }

        public string DestinationFolderId { get; set; }

        public Language Language { get; set; }
    }
}
