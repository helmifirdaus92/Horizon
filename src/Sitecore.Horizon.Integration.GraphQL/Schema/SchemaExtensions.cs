// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.GraphQL.Schema
{
    internal static class SchemaExtensions
    {
        public static string GetNonEmptyStringArg<T>(this ResolveFieldContext<T> ctx, string argumentName)
        {
            var value = ctx.GetArgument<string>(argumentName);
            if (string.IsNullOrEmpty(value))
            {
                throw new HorizonGqlError(GenericErrorCodes.InvalidArgument, $"Argument should be not empty: {argumentName}");
            }

            return value;
        }

        public static void SetQueryContext(this ISitecoreContext scContext, string? language = null, string? site = null, bool? enableItemFiltering = null, DeviceItem? deviceItem = null)
        {
            if (site != null)
            {
                if (site.Length == 0)
                {
                    throw new HorizonGqlError(GenericErrorCodes.InvalidArgument, "Site cannot be empty");
                }

                scContext.SetActiveSite(site);
                scContext.SetDisplayMode(scContext.Site!, DisplayMode.Edit, DisplayModeDuration.Temporary);
            }

            if (language != null)
            {
                if (language.Length == 0)
                {
                    throw new HorizonGqlError(GenericErrorCodes.InvalidArgument, "Language cannot be empty");
                }

                scContext.SetLanguage(Language.Parse(language), persistent: false);
            }

            if (enableItemFiltering != null)
            {
                scContext.Site!.DisableFiltering = !enableItemFiltering.Value;
            }

            if (deviceItem != null)
            {
                scContext.SetDevice(deviceItem);
            }
        }
    }
}
