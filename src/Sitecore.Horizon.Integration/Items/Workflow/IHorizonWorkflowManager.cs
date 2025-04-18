// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal interface IHorizonWorkflowManager
    {
        ItemWorkflowInfo? GetItemWorkflowInfo(Item item);

        WorkflowCommandResult ExecuteCommand(string commandId, string? comment, Item item);
    }
}
