// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.NSubstituteUtils;

namespace Sitecore.Horizon.Integration.Tests.Unit.Helper
{
    internal static class ItemTreeBuilder
    {
        public static FakeItem CreateTree(this Generator<FakeItem> itemGenerator, TreeNode tree)
        {
            return AddChildrenRecursively(itemGenerator, tree);
        }

        private static FakeItem AddChildrenRecursively(Generator<FakeItem> itemGenerator, TreeNode node)
        {
            var children = new List<FakeItem>();
            var parentItem = itemGenerator.First().WithDisplayName(node.Name).WithName(node.Name);

            foreach (var child in node)
            {
                var childItem = AddChildrenRecursively(itemGenerator, child);
                children.Add(childItem);
            }

            parentItem.WithChildren(children);

            return parentItem;
        }
    }
}
