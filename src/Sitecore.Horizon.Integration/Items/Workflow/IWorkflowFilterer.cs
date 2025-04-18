// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Workflows;

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal interface IWorkflowFilterer
    {
        WorkflowCommand[] FilterVisibleCommands(WorkflowCommand[] commands, Item item, Database database);
    }
}
