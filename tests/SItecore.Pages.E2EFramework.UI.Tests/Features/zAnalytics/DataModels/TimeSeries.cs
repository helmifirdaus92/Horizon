// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;

public class TimeSeries
{
    public TimeSeries()
    {
        meta = new MetaInfo
        {
            unitType = "QUANTITY",
            widgetType = "TIMESERIES"
        };
    }

    public Data data { get; set; }
    public MetaInfo meta { get; set; }

    public class Current
    {
        public Current(string name, double value)
        {
            this.name = name;
            this.value = value;
        }

        public string name { get; set; }
        public double value { get; set; }
    }

    public class Data
    {
        public List<Current> current { get; set; }
    }
}
