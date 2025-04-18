// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Configuration;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses
{
    public interface IHorizonApiHelper
    {
        IItemOperations Items { get; }
        ISecurityOperations Security { get; }
        ISitecoreConfiguration Configuration { get; }
    }
}
