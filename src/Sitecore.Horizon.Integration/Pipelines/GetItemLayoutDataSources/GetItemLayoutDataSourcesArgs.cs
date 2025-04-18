// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Sitecore.Data.Items;
using Sitecore.Layouts;

namespace Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources
{
    internal struct GetItemLayoutDataSourcesArgs : IHorizonPipelineArgs
    {
        public bool Aborted { get; set; }

        public Item Item { get; init; }

        public DeviceItem Device { get; init; }

        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Setter required here for extensibility.")]
        public ICollection<RenderingReference>? Renderings { get; set; }

        public ICollection<Item> DataSourceItems { get; init; }

        public static GetItemLayoutDataSourcesArgs Create(Item item, DeviceItem device)
        {
            return new()
            {
                Item = item,
                Device = device,
                DataSourceItems = new List<Item>()
            };
        }
    }
}
