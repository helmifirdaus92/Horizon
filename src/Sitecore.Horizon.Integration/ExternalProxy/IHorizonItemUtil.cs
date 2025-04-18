// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using System.Collections.Generic;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.ExperienceEditor.Utils;
using Sitecore.Layouts;

namespace Sitecore.Horizon.Integration.ExternalProxy
{
    internal interface IHorizonItemUtil
    {
        string BuildLayoutDelta(Field contextLayoutField, string layout);

        LayoutDefinition GetItemFinalLayout(Item item);

        LayoutDefinition GetItemSharedLayout(Item item);

        IEnumerable<Item> GetDefaultDatasources(Item item, DeviceItem device);

        IEnumerable<Item> GetPersonalizedDatasources(Item item, DeviceItem device);

        ICollection<Item> GetDatasources(Item item, DeviceItem device);
    }
}
