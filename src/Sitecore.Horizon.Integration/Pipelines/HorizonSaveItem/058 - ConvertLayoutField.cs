// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Xml.Linq;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;
using Sitecore.StringExtensions;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Processor for saving data.
    /// </summary>
    internal class ConvertLayoutField : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        public ConvertLayoutField(ISitecoreContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">The arguments.</param>
        /// <contract>
        ///   <requires name="args" condition="not null" />
        /// </contract>
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

                    if (field.IsBlobField || !field.Type.Equals("layout", StringComparison.OrdinalIgnoreCase) || field.Value.IsNullOrEmpty() || saveField.Value.IsNullOrEmpty() || field.Value == saveField.Value)
                    {
                        continue;
                    }

                    XDocument originalDocument = XDocument.Parse(field.Value);
                    XDocument newDocument = XDocument.Parse(saveField.Value);

                    // IF layout did not change - use the original value for save. In Save processor this will be ignored
                    if (XNode.DeepEquals(newDocument, originalDocument))
                    {
                        saveField.Value = field.Value;
                    }
                }
            }
        }
    }
}
