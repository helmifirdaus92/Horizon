// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Configuration;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses
{
    public class HorizonApiHelper : IHorizonApiHelper
    {
        public HorizonApiHelper(HelperService helperService)
        {
            Items = new ItemOperations(helperService);
            Security = new SecurityOperations(helperService);
            Configuration = new SitecoreConfiguration(helperService);
        }

        public IItemOperations Items { get; }
        public ISecurityOperations Security { get; }
        public ISitecoreConfiguration Configuration { get; }
    }
}
