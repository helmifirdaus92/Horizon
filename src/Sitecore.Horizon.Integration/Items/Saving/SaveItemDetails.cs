// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.Items.Saving
{
    internal class SaveItemDetails
    {
        public string ItemId { get; set; }

        public int? ItemVersion { get; set; }

        public string? ItemLanguage { get; set; }

        public string? Revision { get; set; }

        public IReadOnlyCollection<FieldValueInfo>? Fields { get; set; }

        public PresentationDetailsInfo? PresentationDetails { get; set; }

        public PresentationDetailsInfo? OriginalPresentationDetails { get; set; }

    }
}
