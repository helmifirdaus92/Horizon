// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;
using Sitecore.Workflows;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Unlocks the item.
    /// </summary>
    internal class WorkflowSaveCommand : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        public WorkflowSaveCommand(ISitecoreContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">The arguments.</param>
        public void Process(ref HorizonSaveItemArgs args)
        {
            IWorkflowProvider? provider = _context.ContentDatabase?.WorkflowProvider;

            foreach (HorizonArgsSaveItem saveItem in args.Items)
            {
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);
                if (item != null)
                {
                    IWorkflow? workflow = provider?.GetWorkflow(item);

                    WorkflowState? state = workflow?.GetState(item);
                    if (state != null)
                    {
                        WorkflowCommand[] commands = workflow!.GetCommands(item);

                        foreach (WorkflowCommand command in commands)
                        {
                            Item? commandItem = _context.ContentDatabase?.GetItem(command.CommandID, _context.Language, Version.Latest);
                            if (commandItem?.Name != "__OnSave")
                            {
                                continue;
                            }

                            workflow.Execute(command.CommandID, item, string.Empty, false);
                        }
                    }
                }
            }
        }
    }
}
