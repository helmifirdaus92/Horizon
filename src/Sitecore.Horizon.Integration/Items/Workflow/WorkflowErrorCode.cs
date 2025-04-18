// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal enum WorkflowErrorCode
    {
        /// <summary>
        /// Returned when trying to modify item while it's locked by another user
        /// </summary>
        ItemLockedByAnotherUser,

        /// <summary>
        /// Returned when trying to modify item while some of it's datasources locked by another user
        /// </summary>
        SomeDatasourcesAreLocked,

        /// <summary>
        /// Returned when user does not have write access to the item
        /// </summary>
        NoAccessRightItemWrite,

        /// <summary>
        /// Returned when user does not have write access to specific workflow state
        /// </summary>
        NoAccessRightWorkflowWrite,

        /// <summary>
        /// Returned when user does not have privilege to execute workflow commands on a specific workflow state
        /// </summary>
        NoAccessRightWorkflowCommandExecute
    }
}
