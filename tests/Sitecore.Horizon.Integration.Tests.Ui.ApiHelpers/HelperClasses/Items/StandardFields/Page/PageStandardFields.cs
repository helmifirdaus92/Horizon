// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Page
{
    public class PageStandardFields : ItemStandardFields, IPageStandardFields
    {
        public PageStandardFields(string contextItemPath, DatabaseType contextDatabase, HelperService helperService) : base(contextItemPath, contextDatabase, helperService)
        {
            Workflow = new PageWorkflowSection(contextItemPath, contextDatabase, helperService);
        }

        public new IPageWorkflowSection Workflow { get; }
    }
}
