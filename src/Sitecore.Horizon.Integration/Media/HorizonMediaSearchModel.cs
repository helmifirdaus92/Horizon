// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Sitecore.ContentSearch;
using Sitecore.Data;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.Media
{
    /// <summary>
    /// Search POCO used in Horizon media discovery queries.
    /// Use own model to decrease the amount of data returned by search engine to a bare minimum we need.
    /// </summary>
    internal class HorizonMediaSearchModel
    {
        [IndexField("_template")]
        public ID TemplateId { get; set; }

        [IndexField("_language")]
        public string Language { get; set; }

        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Setter is required for desired functionality.")]
        [IndexField("_path")]
        public List<ID> Paths { get; set; }

        [IndexField("_latestversion")]
        public bool IsLatestVersion { get; set; }

        [IndexField("_uniqueid")]
        public ItemUri Uri { get; set; }

        [IndexField("__smallupdateddate")]
        [DateTimeFormatter(DateTimeFormatterAttribute.DateTimeKind.ServerTime)]
        public DateTime Updated { get; set; }

        [IndexField("_name")]
        public string Name { get; set; }

        [IndexField("_content")]
        public string Content { get; set; }

        [IndexField("_displayname")]
        public string DisplayName { get; set; }

        public string Alt { get; set; }
    }
}
