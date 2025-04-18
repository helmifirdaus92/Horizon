// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;   

public class Histogram
{
    public Data data { get; set; } = new()
    {
        historic = new List<Current>(),
        current = new List<Current>()
    };

    public MetaInfo meta { get; set; } = new()
    {
        unitType = "QUANTITY",
        widgetType = "HISTOGRAM"
    };

    public class Current
    {
        public Current(string name, int value)
        {
            this.name = name;
            this.value = value;
        }

        public string name { get; set; }
        public int value { get; set; }
    }

    public class Data
    {
        public List<Current> current { get; set; }
        public List<Current> historic { get; set; }
    }
}
