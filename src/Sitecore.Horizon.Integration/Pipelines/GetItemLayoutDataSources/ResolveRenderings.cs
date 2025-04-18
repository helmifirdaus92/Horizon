// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Layouts;

namespace Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources
{
    internal class ResolveRenderings : IHorizonPipelineProcessor<GetItemLayoutDataSourcesArgs>
    {
        public void Process(ref GetItemLayoutDataSourcesArgs args)
        {
            if (args.Renderings == null)
            {
                args.Renderings = ReadRenderingsFromItem(args.Item, args.Device);
            }
        }

        protected virtual ICollection<RenderingReference> ReadRenderingsFromItem(Item item, DeviceItem device)
        {
            var references = new LayoutField(item).GetReferences(device);

            return references != null ? references.ToList() : new List<RenderingReference>();
        }
    }
}
