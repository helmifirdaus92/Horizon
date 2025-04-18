// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page
{
    public class PageParams : ItemParams
    {
        public PageParams(string name = null, string parentPath = null, string path = null, LayoutType pageType = LayoutType.Mvc, PageWorkflowState workflowState = PageWorkflowState.Draft, string template = null, List<PageField> fields = null, DatabaseType database = DatabaseType.Master, bool doNotDelete = false, string id = null)
            : base(name, parentPath, path, template, database, doNotDelete, id)
        {
            PageType = pageType;
            WorkflowState = workflowState;
            Fields = fields;
        }

        public LayoutType PageType { get; set; }
        public PageWorkflowState WorkflowState { get; set; }

        public List<PageField> Fields { get; set; }
    }
}
