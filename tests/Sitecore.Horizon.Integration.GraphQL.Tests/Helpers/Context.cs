// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;

public static class Context
{
    public static ApiHelper ApiHelper;

    public static Dictionary<string, Item> TestItems = new();

    public static string SXAHeadlessTenant;
    public static string SXAHeadlessSite;
}
