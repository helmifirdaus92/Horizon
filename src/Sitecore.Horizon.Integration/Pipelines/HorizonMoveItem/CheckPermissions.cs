// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem
{
    internal class CheckPermissions : IHorizonPipelineProcessor<HorizonMoveItemArgs>
    {
        /// <summary>
        /// This Pipeline processor logic is taken from platform uiDragItemTo pipeline DragItemTo CheckPermissions method
        /// Platform file: Sitecore.Kernel/Shell/Framework/Pipelines/DragItemTo.cs
        /// </summary>
        public void Process(ref HorizonMoveItemArgs args)
        {
            Item targetItem = args.MovePosition != MovePosition.Into ? args.TargetItem.Parent : args.TargetItem;

            if (!targetItem.Access.CanCreate() ||
                !args.ItemToMove.Access.CanMoveTo(targetItem) ||
                args.ItemToMove.Axes.IsAncestorOf(targetItem) ||
                args.ItemToMove.Appearance.ReadOnly)

            {
                args.SetErrorAndAbortPipeline(MoveItemErrorCode.ItemNotAllowedToMoveToTarget);
            }
        }
    }
}
