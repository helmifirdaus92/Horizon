// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;

[JsonObject(ItemNullValueHandling = NullValueHandling.Include)]
public class HeatMap
{
    public HeatMap()
    {
        meta = new MetaInfo
        {
            unitType = "QUANTITY",
            widgetType = "HEATMAP"
        };
        data = new Data();
    }

    public Data data { get; set; }
    public MetaInfo meta { get; set; }

    public class Data
    {
        public Data()
        {
            current = new List<Current>
            {
                new("00:00"),
                new("01:00"),
                new("02:00"),
                new("03:00"),
                new("04:00"),
                new("05:00"),
                new("06:00"),
                new("07:00"),
                new("08:00"),
                new("09:00"),
                new("10:00"),
                new("11:00"),
                new("12:00"),
                new("13:00"),
                new("14:00"),
                new("15:00"),
                new("16:00"),
                new("17:00"),
                new("18:00"),
                new("19:00"),
                new("20:00"),
                new("21:00"),
                new("22:00"),
                new("23:00")
            };
        }

        public List<Current> current { get; set; }
    }

    [JsonObject(ItemNullValueHandling = NullValueHandling.Include)]
    public class Current
    {
        public Current(string name)
        {
            this.name = name;
            series = new List<Series>
            {
                new("Mon"),
                new("Tue"),
                new("Wed"),
                new("Thu"),
                new("Fri"),
                new("Sat"),
                new("Sun")
            };
        }

        public string name { get; set; }
        public List<Series> series { get; set; }
    }

    [JsonObject(ItemNullValueHandling = NullValueHandling.Include)]
    public class Series
    {
        public Series(string name)
        {
            this.name = name;
            value = null;
        }

        public string name { get; set; }
        public string value { get; set; }
    }
}
