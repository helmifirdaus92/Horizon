// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Collections;
using Sitecore.Data.Items;
using Sitecore.NSubstituteUtils;

namespace Sitecore.Horizon.Tests.Unit.Shared.Extensions
{
    public static class FakeItemExtensions
    {
        public static void WithParent(this IEnumerable<FakeItem> children, FakeItem parent)
        {
            foreach (FakeItem fakeItem in children)
            {
                fakeItem.WithParent(parent);
            }
        }

        public static FakeItem WithChildren(this FakeItem parent, IEnumerable<FakeItem> children)
        {
            foreach (FakeItem fakeItem in children)
            {
                fakeItem.WithParent(parent);
            }

            return parent;
        }

        public static FakeItem WithGetChildren(this FakeItem item)
        {
            var scItem = item.ToSitecoreItem();
            scItem.Configure().GetChildren().Returns(_ => scItem.Children);
            scItem.Configure().GetChildren(Any.Arg<ChildListOptions>()).Returns(_ => scItem.Children);

            return item;
        }

        public static Item FindByName(this Item item, string name)
        {
            if (item.Name == name)
            {
                return item;
            }

            foreach (Item child in item.Children)
            {
                var foundItem = FindByName(child, name);
                if (foundItem != null)
                {
                    return foundItem;
                }
            }

            return null;
        }

        public static List<Item> ToSitecoreItems(this IEnumerable<FakeItem> fakeItems)
        {
            return fakeItems.Select(f => f.ToSitecoreItem()).ToList();
        }

        public static FakeItem AsFake(this Item item)
        {
            var fakeItem = item.SyncRoot as FakeItem;
            if (fakeItem == null)
            {
                throw new ArgumentException("Item is not a fake or was not created by AutoFixture.");
            }

            return fakeItem;
        }
    }
}
