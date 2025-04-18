// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem
{
    internal enum MoveItemErrorCode
    {
        /// <summary>
        /// Item to move does not exist or was deleted
        /// </summary>
        ItemToMoveDoesNotExist,

        /// <summary>
        /// Target item does not exist or was deleted
        /// </summary>
        TargetItemDoesNotExist,

        /// <summary>
        /// No permission to move the item to the new location
        /// </summary>
        ItemNotAllowedToMoveToTarget,
    }
}
