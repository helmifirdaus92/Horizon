// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Diagnostics;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    internal class SaveItemError : HorizonResponseError<SaveItemErrorCode>
    {
        public SaveItemError(ID itemId, SaveItemErrorCode errorCode) : base(errorCode)
        {
            Assert.ArgumentNotNull(itemId, nameof(itemId));

            ItemId = itemId.ToGuid();
        }

        public SaveItemError(ID itemId, SaveItemErrorCode errorCode, string message) : base(errorCode, message)
        {
            Assert.ArgumentNotNull(itemId, nameof(itemId));

            ItemId = itemId.ToGuid();
        }

        public Guid ItemId { get; set; }
    }
}
