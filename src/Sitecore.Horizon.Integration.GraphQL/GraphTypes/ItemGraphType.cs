// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Languages;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ItemGraphType : ContentItemGraphType
    {
        public ItemGraphType(IHorizonItemHelper itemHelper, ISitecoreContext scContext, IHorizonWorkflowManager workflowManager, IClientLanguageService clientLanguageService, IHorizonItemTreeBuilder itemTreeBuilder)
            : base(implementContentInterface: true, itemHelper, scContext, workflowManager, clientLanguageService, itemTreeBuilder)
        {
            Name = "Item";
        }
    }
}
