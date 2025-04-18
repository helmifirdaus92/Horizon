// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline;
using Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;

namespace Sitecore.Horizon.Integration.Pipelines
{
    internal interface IHorizonPipelines
    {
        void SaveItem(ref HorizonSaveItemArgs args);

        void ResolveHorizonMode(ref ResolveHorizonModeArgs args);

        void BuildHorizonPageExtenders(ref BuildHorizonPageExtendersArgs args);

        void GetItemLayoutDataSources(ref GetItemLayoutDataSourcesArgs args);

        void HorizonMoveItem(ref HorizonMoveItemArgs args);

        void PopulateRawTimelineMetadata(ref PopulateRawTimelineMetadataArgs args);

        void BuildItemPublishingTimeline(ref BuildItemPublishingTimelineArgs args);
    }
}
