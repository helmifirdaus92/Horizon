// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface IItemStandardFields
    {
        IAdvancedSection Advanced { get; }
        IAppearanceSection Appearance { get; }
        IInsertOptionsSection InsertOptions { get; }
        ILayoutSection Layout { get; }
        ILifetimeSection Lifetime { get; }
        IPublishingSection Publishing { get; }
        IWorkflowSection Workflow { get; }
        ISecuritySection Security { get; }
        IStatisticsSection Statistics { get; }
        IVersionSection Version { get; }
        IEditorOptionsSection EditorOptions { get; }
    }
}
