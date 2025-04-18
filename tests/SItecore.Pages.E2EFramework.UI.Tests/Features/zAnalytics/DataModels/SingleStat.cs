// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;

[JsonObject(ItemNullValueHandling = NullValueHandling.Ignore)]
public class SingleStat
{
    public SingleStat()
    {
        meta = new MetaInfo
        {
            unitType = "QUANTITY",
            widgetType = "SINGLESTAT"
        };
    }

    public Data data { get; set; }
    public MetaInfo meta { get; }

    public class Data
    {
        public double current { get; set; }
        public double historic { get; set; }
    }
}
