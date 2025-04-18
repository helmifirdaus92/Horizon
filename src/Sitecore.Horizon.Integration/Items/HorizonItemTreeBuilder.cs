// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Sitecore.Data;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Items
{
    internal class HorizonItemTreeBuilder : IHorizonItemTreeBuilder
    {
        private readonly IHorizonItemHelper _itemHelper;
        private readonly ID SXA_PAGE_BRANCH_FOLDER_TEMPLATE_ID = new("{35E75C72-4985-4E09-88C3-0EAC6CD1E64F}");

        public HorizonItemTreeBuilder(IHorizonItemHelper itemHelper)
        {
            _itemHelper = itemHelper;
        }

        // Builds ancestors tree only for Sites pages and Page Branches pages
        // Returns empty array if requested item doesn't belong to Sites pages or Page Branches pages
        public Item[] BuildAncestorsTreeFlat(Item item, Item rootItem)
        {
            if (item.ID == rootItem.ID)
            {
                return new[]
                {
                    item
                };
            }

            var result = new List<Item>();
            var recursiveParent = item.Parent;

            while (recursiveParent != null)
            {
                result.Add(recursiveParent);

                if (recursiveParent.TemplateID == SXA_PAGE_BRANCH_FOLDER_TEMPLATE_ID)
                {
                    break;
                }

                if (rootItem != null && recursiveParent.ID == rootItem.ID)
                {
                    break;
                }

                if (!_itemHelper.IsHorizonItem(recursiveParent))
                {
                    return Array.Empty<Item>();
                }

                recursiveParent = recursiveParent.Parent;
            }

            result.Reverse();

            return result.ToArray();
        }

        public Item[]? AncestorsWithSiblingsTreeFlat(Item item, IReadOnlyCollection<Item> rootItems)
        {
            var ancestorsWithSiblingsTree = new List<Item>();

            var allAncestorIds = new HashSet<ID>();
            bool rootWasReached = false;
            foreach (Item rootItem in rootItems)
            {
                (bool hasReachedRoot, HashSet<ID> ancestorIds) = GetAncestorIds(item, rootItem, condition: null);
                allAncestorIds.UnionWith(ancestorIds);
                rootWasReached |= hasReachedRoot;
            }

            if (!rootWasReached)
            {
                return null;
            }

            foreach (Item rootItem in rootItems)
            {
                AddChildrenRecursively(rootItem, allAncestorIds, ancestorsWithSiblingsTree, condition: null);
            }

            return ancestorsWithSiblingsTree.ToArray();
        }

        public IEnumerable<Item>? TryBuildMediaFolderAncestorsTree(Item item, IReadOnlyCollection<Item> rootItems)
        {
            var ancestorsWithSiblingsTree = new List<Item>();

            var allAncestorIds = new HashSet<ID>();
            bool rootWasReached = false;
            foreach (Item rootItem in rootItems)
            {
                (bool hasReachedRoot, HashSet<ID> ancestorIds) = GetAncestorIds(item, rootItem, IsMediaFolder);
                allAncestorIds.UnionWith(ancestorIds);
                rootWasReached |= hasReachedRoot;
            }

            if (!rootWasReached)
            {
                return null;
            }

            foreach (Item rootItem in rootItems)
            {
                AddChildrenRecursively(rootItem, allAncestorIds, ancestorsWithSiblingsTree, IsMediaFolder);
            }

            return ancestorsWithSiblingsTree;

            bool IsMediaFolder(Item candidate) => _itemHelper.IsMediaFolder(candidate) || _itemHelper.IsFolder(candidate);
        }

        private static (bool hasReachedRoot, HashSet<ID> ancestorIds) GetAncestorIds(Item item, Item rootItem, Predicate<Item>? condition)
        {
            var hasReachedRoot = false;
            var ancestorIds = new HashSet<ID>();
            var nextAncestor = item;

            while (nextAncestor != null)
            {
                if (condition != null && !condition(nextAncestor))
                {
                    break;
                }

                ancestorIds.Add(nextAncestor.ID);
                if (nextAncestor.ID == rootItem.ID)
                {
                    hasReachedRoot = true;
                    break;
                }

                // Do not use item.Parent as it returns item even when you do not have access rights.
                nextAncestor = nextAncestor.Database.GetItem(nextAncestor.ParentID);
            }

            return (hasReachedRoot, ancestorIds);
        }

        private static void AddChildrenRecursively(Item currentItem, ICollection<ID> ancestorsIds, ICollection<Item> result, Predicate<Item>? condition)
        {
            if (condition != null && !condition(currentItem))
            {
                return;
            }

            result.Add(currentItem);

            // Include children if currentItem is one of the ancestor
            if (ancestorsIds.Contains(currentItem.ID))
            {
                foreach (Item child in currentItem.Children)
                {
                    AddChildrenRecursively(child, ancestorsIds, result, condition);
                }
            }
        }
    }
}
