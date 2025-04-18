// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Items
{
    internal interface IHorizonItemTreeBuilder
    {
        Item[] BuildAncestorsTreeFlat(Item item, Item rootItem);
        Item[]? AncestorsWithSiblingsTreeFlat(Item item, IReadOnlyCollection<Item> rootItems);
        IEnumerable<Item>? TryBuildMediaFolderAncestorsTree(Item item, IReadOnlyCollection<Item> rootItems);
    }
}
