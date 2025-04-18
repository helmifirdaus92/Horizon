// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL;
using GraphQL.Types;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.DependencyInjection;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Controllers;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Validation;
using Sitecore.Horizon.Integration.GraphQL.Mutations;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.AddVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.ChangeDisplayName;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Create;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Delete;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteItemVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteLayoutRules;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Move;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Rename;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.RenameItemVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Save;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.SetLayoutKind;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Media;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Media.UploadMedia;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Publishing;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Workflow;
using Sitecore.Horizon.Integration.GraphQL.Queries;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Media.Models;

namespace Sitecore.Horizon.Integration.GraphQL.DependencyInjection
{
    [UsedInConfiguration]
    internal class HorizonIntegrationGqlConfigurator : IServicesConfigurator
    {
        public void Configure(IServiceCollection services)
        {
            services.AddTransient<HorizonQueryController>(p => new HorizonQueryController(p.GetRequiredService<IHorizonSchema>()));

            services.AddSingleton<IHorizonSchema, HorizonSchema>();
            services.AddSingleton<IDependencyResolver, ServiceProviderDependencyResolver>();

            // Helper types
            services.AddSingleton<IHorizonMutationHelper, HorizonMutationHelper>();

            // Queries
            services.AddSingleton<HorizonQueries>();
            services.AddSingleton<HorizonComponentQueries>();
            services.AddSingleton<HorizonConfigurationQueries>();
            services.AddSingleton<HorizonDataSourceResolverQueries>();
            services.AddSingleton<HorizonMediaQueries>();
            services.AddSingleton<HorizonPublishingQueries>();
            services.AddSingleton<HorizonRenderingDefinitionQueries>();
            services.AddSingleton<HorizonPersonalizationQueries>();

            // Mutations
            services.AddSingleton<HorizonBasicMutations>();
            services.AddSingleton<HorizonPublishingMutations>();
            services.AddSingleton<HorizonWorkflowMutations>();
            services.AddSingleton<HorizonMediaMutations>();

            // Schema types
            services.AddSingleton(typeof(EnumerationGraphType<>));
            services.AddSingleton<BranchTemplateGraphType>();
            services.AddSingleton<ComponentsGraphType>();
            services.AddSingleton<ComponentGroupGraphType>();
            services.AddSingleton<ComponentInfoGraphType>();
            services.AddSingleton<ContentInterfaceGraphType>();
            services.AddSingleton<ContentItemLockingGraphType>();
            services.AddSingleton<ContentItemPermissionsGraphType>();
            services.AddSingleton<ContentItemPublishingGraphType>();
            services.AddSingleton<ExtendedPropertiesGraphType>();
            services.AddSingleton<FieldValueGraphType>();
            services.AddSingleton<FolderGraphType>();
            services.AddSingleton<InsertOptionInterfaceGraphType>();
            services.AddSingleton<ItemGraphType>();
            services.AddSingleton<ItemInsertOptionGraphType>();
            services.AddSingleton<ItemTemplateGraphType>();
            services.AddSingleton<ItemTimelineGraphType>();
            services.AddSingleton<LanguageGraphType>();
            services.AddSingleton<MediaFolderItemGraphType>();
            services.AddSingleton<MediaItemGraphType>();
            services.AddSingleton<MediaItemPermissionsGraphType>();
            services.AddSingleton<MediaQueryResultGraphType>();
            services.AddSingleton<MovePositionGraphType>();
            services.AddSingleton<PageGraphType>();
            services.AddSingleton<PlatformConfigurationGraphType>();
            services.AddSingleton<PageTimelineGraphType>();
            services.AddSingleton<RuleInfoGraphType>();
            services.AddSingleton<RuleConditionsInfoGraphType>();
            services.AddSingleton<RuleActionsInfoGraphType>();
            services.AddSingleton<PresentationDetailsGraphType>();
            services.AddSingleton<PublishingRangeGraphType>();
            services.AddSingleton<PublishingStatusGraphType>();
            services.AddSingleton<RawItemGraphType>();
            services.AddSingleton<RenderingDefinitionGraphType>();
            services.AddSingleton<SavedItemFieldGraphType>();
            services.AddSingleton<SavedItemGraphType>();
            services.AddSingleton<SaveItemDetailsGraphType>();
            services.AddSingleton<SaveItemErrorGraphType>();
            services.AddSingleton<SiteGraphType>();
            services.AddSingleton<TemplateFieldGraphType>();
            services.AddSingleton<TemplateGraphType>();
            services.AddSingleton<UserProfileGraphType>();
            services.AddSingleton<ValidationErrorGraphType>();
            services.AddSingleton<WorkflowCommandGraphType>();
            services.AddSingleton<WorkflowErrorGraphType>();
            services.AddSingleton<WorkflowStateGraphType>();
            services.AddSingleton<ValidationResultGraphType>();
            services.AddSingleton<ItemValidationResultGraphType>();
            services.AddSingleton<FieldValidationResultGraphType>();
            services.AddSingleton<ItemValidationRecordGraphType>();
            services.AddSingleton<ItemVersionInfoGraphType>();
            services.AddSingleton<StringWithPossibleDateTimeFormatGraphType>();
            services.AddSingleton<EnvironmentFeatureGraphType>();

            // Mutation types
            services.AddSingleton<AddItemVersionInput>();
            services.AddSingleton<AddItemVersionOutput>();
            services.AddSingleton<ChangeDisplayNameInput>();
            services.AddSingleton<ChangeDisplayNameOutput>();
            services.AddSingleton<CreateFolderInput>();
            services.AddSingleton<CreateFolderOutput>();
            services.AddSingleton<CreatePageInput>();
            services.AddSingleton<CreatePageOutput>();
            services.AddSingleton<DuplicateItemInput>();
            services.AddSingleton<DuplicateItemOutput>();
            services.AddSingleton<CreateRawItemInput>();
            services.AddSingleton<CreateRawItemOutput>();
            services.AddSingleton<DeleteItemInput>();
            services.AddSingleton<DeleteItemOutput>();
            services.AddSingleton<DeleteItemVersionInput>();
            services.AddSingleton<DeleteItemVersionOutput>();
            services.AddSingleton<DeleteLayoutRulesInput>();
            services.AddSingleton<DeleteLayoutRulesOutput>();
            services.AddSingleton<MoveItemInput>();
            services.AddSingleton<MoveItemOutput>();
            services.AddSingleton<RenameItemInput>();
            services.AddSingleton<RenameItemOutput>();
            services.AddSingleton<RenameItemVersionInput>();
            services.AddSingleton<RenameItemVersionOutput>();
            services.AddSingleton<SaveItemInput>();
            services.AddSingleton<SaveItemOutput>();
            services.AddSingleton<PublishItemInput>();
            services.AddSingleton<PublishItemOutput>();
            services.AddSingleton<SetPublishingSettingsInput>();
            services.AddSingleton<SetPublishingSettingsOutput>();
            services.AddSingleton<ExecuteCommandInput>();
            services.AddSingleton<ExecuteCommandOutput>();
            services.AddSingleton<UploadMediaInput>();
            services.AddSingleton<UploadMediaOutput>();
            services.AddSingleton<UploadMediaModel>();
            services.AddSingleton<SetLayoutEditingKindInput>();
            services.AddSingleton<SetLayoutEditingKindOutput>();
        }
    }
}
