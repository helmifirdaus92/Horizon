// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Workflows;

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal class ItemWorkflowInfo
    {
        public WorkflowState State { get; set; } = null!;
        public List<WorkflowCommand> Commands { get; } = new();
        public List<WorkflowError> Warnings { get; } = new();
        public bool CanEdit { get; set; }
    }
}
