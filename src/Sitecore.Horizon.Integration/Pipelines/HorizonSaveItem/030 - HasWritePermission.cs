// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Checks write permissions.
    /// </summary>
    [SuppressMessage("Microsoft.Naming", "CA1711:IdentifiersShouldNotHaveIncorrectSuffix", Justification = "Due to sitecore platform write Permission")]
    internal class HasWritePermission : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        public HasWritePermission(ISitecoreContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">The arguments.</param>
        public void Process(ref HorizonSaveItemArgs args)
        {
            foreach (HorizonArgsSaveItem saveItem in args.Items)
            {
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);
                if (item == null)
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.ItemDoesNotExist));
                }
                else if (!item.Access.CanWrite())
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.NoWriteAccess));
                }
                else if (!item.Access.CanWriteLanguage())
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.NoLanguageWriteAccess));
                }
                else if (item.IsFallback)
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.ItemIsFallback));
                }
                else if (item.Appearance.ReadOnly)
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.ItemIsProtected));
                }
                else
                {
                    foreach (HorizonArgsSaveField saveField in saveItem.Fields)
                    {
                        Field field = item.Fields[saveField.ID];
                        if (!field.CanUserWrite(_context.User))
                        {
                            args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.NoWriteAccess));
                        }

                    }
                }
            }
        }
    }
}
