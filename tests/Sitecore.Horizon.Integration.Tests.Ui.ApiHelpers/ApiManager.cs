// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses;
using UTF;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers
{
    public static class ApiManager
    {
        public static IHorizonApiHelper GetApiHelper(string instanceName, int helperServiceTimeout = 10000)
        {
            HelperService helperService = Context.HelperServices[instanceName];
            TestData.Init(helperService);
            return new HorizonApiHelper(helperService);
        }
    }
}
