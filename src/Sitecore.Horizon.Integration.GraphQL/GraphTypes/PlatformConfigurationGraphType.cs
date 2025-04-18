// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class PlatformConfigurationGraphType : ObjectGraphType<PlatformConfigurationGraphType>
    {
        public PlatformConfigurationGraphType()
        {
            Name = "Configuration";

            Field<NonNullGraphType<ListGraphType<StringGraphType>>>(
                "additionalPlatformUrls",
                resolve: context => context.Source.AdditionalPlatformUrls
            );

            Field<NonNullGraphType<StringGraphType>>(
                "hostVerificationToken",
                resolve: context => context.Source.HostVerificationToken
            );
            Field<NonNullGraphType<StringGraphType>>(
                "contentRootItemId",
                resolve: context => context.Source.ContentRootItemId
            );
            Field<NonNullGraphType<StringGraphType>>(
                "clientLanguage",
                resolve: context => context.Source.ClientLanguage
            );

            Field<NonNullGraphType<StringGraphType>>(
                "integrationVersion",
                resolve: context => context.Source.IntegrationVersion
            );

            Field<NonNullGraphType<StringGraphType>>(
                "sessionTimeoutSeconds",
                resolve: context => context.Source.SessionTimeoutSeconds
            );

            Field<StringGraphType>(
                "jssEditingSecret",
                resolve: context => context.Source.JssEditingSecret
            );

            Field<StringGraphType>(
                "personalizeScope",
                resolve: context => context.Source.PersonalizeScope
            );

            Field<StringGraphType>(
                "globalTagsRepository",
                resolve: context => context.Source.GlobalTagsRepository
            );

            Field<ListGraphType<EnvironmentFeatureGraphType>>(
                "environmentFeatures",
                resolve: context => context.Source.EnvironmentFeatures
            );
        }

        public IEnumerable<Uri> AdditionalPlatformUrls { get; set; } = Array.Empty<Uri>();

        public string HostVerificationToken { get; set; } = string.Empty;

        public Guid ContentRootItemId { get; set; }

        public string ClientLanguage { get; set; } = string.Empty;

        public string IntegrationVersion { get; set; } = FileVersionInfo.GetVersionInfo(Assembly.GetExecutingAssembly().Location).FileVersion;

        public string SessionTimeoutSeconds { get; set; } = string.Empty;

        public string? JssEditingSecret { get; set; }


        public string? PersonalizeScope { get; set; }

        public string? GlobalTagsRepository { get; set; }


        public Dictionary<string, bool>? EnvironmentFeatures { get; set; }
    }
}
