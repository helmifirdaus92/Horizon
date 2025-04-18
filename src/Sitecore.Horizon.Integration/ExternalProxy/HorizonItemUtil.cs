// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.IdentityModel.Protocols.WSTrust;
using System.Linq;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.ExperienceEditor.Utils;
using Sitecore.Layouts;

namespace Sitecore.Horizon.Integration.ExternalProxy
{
    internal class HorizonItemUtil : IHorizonItemUtil
    {
        public string BuildLayoutDelta(Field contextLayoutField, string layout)
        {
            string baseLayoutValue = LayoutField.GetBaseLayoutValue(contextLayoutField);
            return string.IsNullOrEmpty(baseLayoutValue) ? layout : XmlDeltas.GetDelta(layout, baseLayoutValue);
        }

        public LayoutDefinition GetItemFinalLayout(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            return LayoutDefinition.Parse(new LayoutField(item).Value);
        }

        public LayoutDefinition GetItemSharedLayout(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            return LayoutDefinition.Parse(new LayoutField(item.Fields[FieldIDs.LayoutField]).Value);
        }

        public IEnumerable<Item> GetDefaultDatasources(Item item, DeviceItem device)
        {
            IEnumerable<Item> datasources;
            using (new ContextItemSwitcher(item))
            {
                datasources = ItemUtility.FilterSameItems(ItemUtility.GetItemsFromLayoutDefinedDatasources(item, device, item.Language));
            }
            return datasources;
        }

        public IEnumerable<Item> GetPersonalizedDatasources(Item item, DeviceItem device)
        {
            IEnumerable<Item> datasources;
            using (new ContextItemSwitcher(item))
            {
                datasources = ItemUtility.FilterSameItems(ItemUtility.GetPersonalizationRulesItems(item, device, item.Language));
            }
            return datasources;
        }

        public ICollection<Item> GetDatasources(Item item, DeviceItem device)
        {
            var datasources = new List<Item>();
            datasources.AddRange(GetDefaultDatasources(item, device));
            datasources.AddRange(GetPersonalizedDatasources(item, device));
            return ItemUtility.FilterSameItems(datasources).ToArray();
        }
    }
}
