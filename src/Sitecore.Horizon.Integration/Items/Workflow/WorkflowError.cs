// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data;
using Sitecore.Horizon.Integration.Diagnostics;

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal class WorkflowError : HorizonResponseError<WorkflowErrorCode>
    {
        public WorkflowError(ID itemId, WorkflowErrorCode errorCode) : base(errorCode)
        {
            ItemId = itemId.ToGuid();
        }

        public WorkflowError(ID itemId, WorkflowErrorCode errorCode, string message) : base(errorCode, message)
        {
            ItemId = itemId.ToGuid();
        }

        public Guid ItemId { get; set; }
    }
}
