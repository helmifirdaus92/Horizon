// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Page
{
    public interface IPageStandardFields : IItemStandardFields
    {
        new IPageWorkflowSection Workflow { get; }
    }
}
