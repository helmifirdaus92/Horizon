// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Items.Saving
{
    internal class FieldValueInfo
    {
        public string? Id { get; set; }

        public string? Value { get; set; }

        public string? OriginalValue { get; set; }

        public bool? Reset {  get; set; }
    }
}
