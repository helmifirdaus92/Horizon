// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI.Helpers
{
    internal static class SharedSteps
    {
        internal static IPageItem CreatePageWithAllFieldsTypes()
        {
            var templateWithAllFieldTypes = Context.ApiHelper.Items.PermanentlyCreatedItems.GetTemplateWithAllFieldTypes();
            var page = Context.ApiHelper.Items.CreatePage(new PageParams(template: templateWithAllFieldTypes.Id));
            return page;
        }
    }
}
