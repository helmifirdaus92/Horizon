// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Processor for saving Html image links.
    /// </summary>
    internal class TightenRelativeImageLinks : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        public TightenRelativeImageLinks(ISitecoreContext context)
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
                    continue;
                }

                foreach (HorizonArgsSaveField saveField in saveItem.Fields)
                {
                    Field field = item.Fields[saveField.ID];

                    string type = field.TypeKey;

                    if (type == "html" || type == "rich text")
                    {
                        saveField.Value = HtmlField.TightenRelativeImageLinks(saveField.Value);
                    }
                }
            }
        }
    }
}
