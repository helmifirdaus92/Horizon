// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem
{
    internal class MoveItemTo : IHorizonPipelineProcessor<HorizonMoveItemArgs>
    {
        /// <summary>
        /// This Pipeline processor logic is taken from platform uiDragItemTo pipeline DragItemTo Execute method
        /// Platform file: Sitecore.Kernel/Shell/Framework/Pipelines/DragItemTo.cs
        /// </summary>
        public void Process(ref HorizonMoveItemArgs args)
        {
            Assert.ArgumentNotNull(args.ItemToMove, nameof(args.ItemToMove));
            Assert.ArgumentNotNull(args.TargetItem, nameof(args.TargetItem));

            Item targetItem = args.MovePosition != MovePosition.Into ? args.TargetItem.Parent : args.TargetItem;

            args.ItemToMove.MoveTo(targetItem);

            SetSortOrder(args);
        }

        private static void SetSortOrder(HorizonMoveItemArgs args)
        {
            Assert.ArgumentNotNull(args, "args");

            if (args.MovePosition == MovePosition.Into)
            {
                return;
            }

            Item target = args.TargetItem;
            int sortOrder = target.Appearance.Sortorder;

            switch (args.MovePosition)
            {
                case MovePosition.After:
                {
                    Item next = target.Axes.GetNextSibling();

                    if (next != null)
                    {
                        int nextSortOrder = next.Appearance.Sortorder;

                        if (Math.Abs(nextSortOrder - sortOrder) >= 2)
                        {
                            sortOrder += (nextSortOrder - sortOrder) / 2;
                        }
                        else if (target.Parent != null)
                        {
                            sortOrder = ReSort(target, MovePosition.After);
                        }
                    }
                    else
                    {
                        sortOrder += 100;
                    }

                    break;
                }
                case MovePosition.Before:
                {
                    Item prev = target.Axes.GetPreviousSibling();

                    if (prev != null)
                    {
                        int prevSortOrder = prev.Appearance.Sortorder;

                        if (Math.Abs(prevSortOrder - sortOrder) >= 2)
                        {
                            sortOrder -= (sortOrder - prevSortOrder) / 2;
                        }
                        else if (target.Parent != null)
                        {
                            sortOrder = ReSort(target, MovePosition.Before);
                        }
                    }
                    else
                    {
                        sortOrder -= 100;
                    }

                    break;
                }
                case MovePosition.Into:
                    break;
            }

            SetItemSortOrder(args.ItemToMove, sortOrder);
        }

        private static void SetItemSortOrder(Item item, int sortOrder)
        {
            Assert.ArgumentNotNull(item, "item");

            using (new StatisticDisabler(StatisticDisablerState.ForItemsWithoutVersionOnly))
            {
                item.Editing.BeginEdit();
                item.Appearance.Sortorder = sortOrder;
                item.Editing.EndEdit();
            }
        }

        private static int ReSort(Item target, MovePosition movePosition)
        {
            Assert.ArgumentNotNull(target, "target");

            int result = 0;
            int n = 0;
            foreach (Item child in target.Parent.Children)
            {
                SetItemSortOrder(child, n * 100);
                if (child.ID == target.ID)
                {
                    result = movePosition == MovePosition.Before ? n * 100 - 50 : n * 100 + 50;
                }

                n++;
            }

            return result;
        }
    }
}
