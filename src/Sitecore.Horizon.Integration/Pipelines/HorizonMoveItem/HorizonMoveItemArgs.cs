// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem
{
    internal struct HorizonMoveItemArgs : IHorizonPipelineArgs
    {
        public bool Aborted { get; set; }

        public Item ItemToMove { get; init; }

        public Item TargetItem { get; init; }

        public MovePosition MovePosition { get; init; }

        public MoveItemErrorCode? Error { get; set; }

        public static HorizonMoveItemArgs Create(Item itemToMove, Item targetItem, MovePosition movePosition)
        {
            return new()
            {
                ItemToMove = itemToMove,
                TargetItem = targetItem,
                MovePosition = movePosition
            };
        }

        public void SetErrorAndAbortPipeline(MoveItemErrorCode error)
        {
            Error = error;
            Aborted = true;
        }
    }
}
