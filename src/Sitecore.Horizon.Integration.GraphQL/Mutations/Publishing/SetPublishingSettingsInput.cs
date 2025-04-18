// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Publishing
{
    internal class SetPublishingSettingsInput : BaseItemInput
    {
        public SetPublishingSettingsInput()
        {
            Name = "SetPublishingSettingsInput";
            Field<NonNullGraphType<StringGraphType>>("path");
            Field<NonNullGraphType<IntGraphType>>("versionNumber");
            Field<NonNullGraphType<StringWithPossibleDateTimeFormatGraphType>>("validFromDate");
            Field<NonNullGraphType<StringWithPossibleDateTimeFormatGraphType>>("validToDate");
            Field<NonNullGraphType<BooleanGraphType>>("isAvailableToPublish");
        }

        public string Path { get; set; }
        public int VersionNumber { get; set; }
        public string ValidFromDate { get; set; }
        public string ValidToDate { get; set; }
        public bool IsAvailableToPublish { get; set; }
    }
}
