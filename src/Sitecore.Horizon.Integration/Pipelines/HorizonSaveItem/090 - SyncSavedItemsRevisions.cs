// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    internal class SyncSavedItemsRevisions : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        public SyncSavedItemsRevisions(ISitecoreContext context)
        {
            _context = context;
        }

        public void Process(ref HorizonSaveItemArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            foreach (HorizonArgsSaveItem saveItem in args.SavedItems)
            {
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);
                if (item != null)
                {
                    //we should know the latest items revision to build correct saving result
                    saveItem.Revision = item.Statistics.Revision;
                }
            }
        }
    }
}
