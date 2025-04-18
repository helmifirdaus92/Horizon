// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Page
{
    public interface IPageWorkflowSection : IWorkflowSection
    {
        new PageWorkflowState GetWorkflowState();
        new PageWorkflowState GetWorkflowState(string language, int version);
        void SetWorkflowState(PageWorkflowState pageWorkflowState);
        void SetWorkflowState(PageWorkflowState pageWorkflowState, string language, int version);
    }
}
