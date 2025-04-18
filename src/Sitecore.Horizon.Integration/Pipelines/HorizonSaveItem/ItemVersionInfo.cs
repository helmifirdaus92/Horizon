// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

#nullable disable warnings // It's a model

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    internal class ItemVersionInfo
    {
        public Guid ItemId { get; set; }

        public int VersionNumber { get; set; }

        public string DisplayName { get; set; }
    }
}
