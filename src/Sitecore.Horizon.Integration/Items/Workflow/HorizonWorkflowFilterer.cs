// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Workflows;

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal class HorizonWorkflowFilterer : IWorkflowFilterer
    {
        private readonly ISitecoreContext _context;

        public HorizonWorkflowFilterer(ISitecoreContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public WorkflowCommand[] FilterVisibleCommands(WorkflowCommand[] commands, Item item, Database database)
        {
            if (commands == null)
            {
                throw new ArgumentNullException(nameof(commands));
            }

            WorkflowCommand[]? filteredCommands;
            var oldValue = _context.ContentDatabase;

            // Switch content database - WorkflowFilterer uses content database (likely, because it's expected to be run in context of shell site, rather than website like sites).
            try
            {
                _context.ContentDatabase = database;
                filteredCommands = WorkflowFilterer.FilterVisibleCommands(commands, item);
            }
            finally
            {
                _context.ContentDatabase = oldValue;
            }

            return filteredCommands;
        }
    }
}
