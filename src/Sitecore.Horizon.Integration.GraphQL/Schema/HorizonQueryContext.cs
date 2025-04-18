// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using GraphQL.Types;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.GraphQL.Schema
{
    internal class HorizonQueryContext
    {
        public Item? ContextItem { get; set; }
        public bool HorizonOnlyItems { get; set; } = true;
    }

    internal static class HorizonQueryContextExtension
    {
        public static HorizonQueryContext GetHorizonUserContext<T>(this ResolveFieldContext<T> fieldResolveContext)
        {
            if (fieldResolveContext.UserContext is HorizonQueryContext ctx)
            {
                return ctx;
            }

            throw new InvalidOperationException("User context is not valid");
        }
    }
}
