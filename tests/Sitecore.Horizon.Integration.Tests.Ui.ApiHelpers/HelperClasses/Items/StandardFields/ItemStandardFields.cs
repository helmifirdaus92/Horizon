// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class ItemStandardFields : IItemStandardFields
    {
        public ItemStandardFields(string contextItemPath, DatabaseType contextDatabase, HelperService helperService)
        {
            Advanced = new AdvancedSection(contextItemPath, contextDatabase, helperService);
            Appearance = new AppearanceSection(contextItemPath, contextDatabase, helperService);
            InsertOptions = new InsertOptionsSection(contextItemPath, contextDatabase, helperService);
            Layout = new LayoutSection(contextItemPath, contextDatabase, helperService);
            Lifetime = new LifetimeSection(contextItemPath, contextDatabase, helperService);
            Publishing = new PublishingSection(contextItemPath, contextDatabase, helperService);
            Workflow = new WorkflowSection(contextItemPath, contextDatabase, helperService);
            Security = new SecuritySection(contextItemPath, contextDatabase, helperService);
            Statistics = new StatisticsSection(contextItemPath, contextDatabase, helperService);
            Version = new VersionSection(contextItemPath, contextDatabase, helperService);
            EditorOptions = new EditorOptionsSection(contextItemPath, contextDatabase, helperService);
        }

        public IAdvancedSection Advanced { get; }
        public IAppearanceSection Appearance { get; }

        public IInsertOptionsSection InsertOptions { get; }

        public ILayoutSection Layout { get; }

        public ILifetimeSection Lifetime { get; }

        public IPublishingSection Publishing { get; }

        public IWorkflowSection Workflow { get; }

        public ISecuritySection Security { get; }

        public IStatisticsSection Statistics { get; }

        public IVersionSection Version { get; }
        public IEditorOptionsSection EditorOptions { get; }
    }
}
