// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Microsoft.Extensions.DependencyInjection;
using Sitecore.DependencyInjection;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Saving;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Media;
using Sitecore.Horizon.Integration.Modes;
using Sitecore.Horizon.Integration.Personalization;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline;
using Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Horizon.Integration.Presentation.Mapper;
using Sitecore.Horizon.Integration.Publishing;
using Sitecore.Horizon.Integration.Search;
using Sitecore.Horizon.Integration.Security;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Integration.Web;
using Sitecore.SecurityModel.Cryptography;

namespace Sitecore.Horizon.Integration.DependencyInjection
{
    [UsedInConfiguration]
    internal class HorizonServiceConfigurator : IServicesConfigurator
    {
        public void Configure(IServiceCollection services)
        {
            Assert.ArgumentNotNull(services, nameof(services));

            services.AddSingleton<ISitecoreContext, SitecoreContextWrapper>();
            services.AddSingleton<IHeadlessContextWrapper, HeadlessContextWrapper>();
            services.AddSingleton<ISitecoreContextHelper, SitecoreContextHelper>();
            services.AddSingleton<ISitecoreLegacySettings, SitecoreLegacySettings>();

            services.AddSingleton<IHorizonInitializer, HorizonInitializer>();

            services.AddSingleton<HorizonContext>();
#pragma warning disable CS0618 // Type or member is obsolete
            services.AddSingleton<IHorizonContext>(sp => sp.GetRequiredService<HorizonContext>());
            services.AddSingleton<IHorizonInternalContext>(sp => sp.GetRequiredService<HorizonContext>());

            services.AddSingleton<IHorizonRequestHelper, HorizonRequestHelper>();
#pragma warning restore CS0618 // Type or member is obsolete

            services.AddSingleton<IHorizonModeHandler, EditorModeHandler>();
            services.AddSingleton<IHorizonModeHandler, PreviewModeHandler>();
            services.AddSingleton<IHorizonModeHandler, ApiModeHandler>();
            services.AddSingleton<IHorizonModeHandlerResolver, HorizonModeHandlerResolver>();

            services.AddSingleton<ICanvasMessageFactory, CanvasMessageFactory>();

            services.AddSingleton<IHorizonItemHelper, HorizonItemHelper>();
            services.AddSingleton<IWorkflowFilterer, HorizonWorkflowFilterer>();
            services.AddSingleton<IItemPermissionChecker, ItemPermissionChecker>();

            services.AddSingleton<IPublishingChecker, PublishingChecker>();
            services.AddSingleton<IPublishingTargetInfo, PublishingTargetInfo>();

            services.AddTransient<IHorizonSiteManager, HorizonSiteManager>();

            services.AddSingleton<IHorizonItemUtil, HorizonItemUtil>();
            services.AddSingleton<IThemeHelper, ThemeHelper>();
            services.AddSingleton<IHorizonMediaManager, HorizonMediaManager>();
            services.AddSingleton<IMediaCreatorWrapper, MediaCreatorWrapper>();
            services.AddSingleton<IMediaSearcher, MediaSearcher>();
            services.AddSingleton<IMediaUploader, MediaUploader>();
            services.AddSingleton<IMediaTemplateDiscoverer, MediaTemplateDiscoverer>();
            services.AddSingleton<IPlatformSearchRunner, PlatformSearchRunner>();
            services.AddSingleton<IPresentationDetailsRepository, PresentationDetailsRepository>();
            services.AddSingleton<IPresentationDetailsMapper, PresentationDetailsMapper>();
            services.AddSingleton<ILayoutDefinitionMapper, LayoutDefinitionMapper>();
            services.AddSingleton<IPersonalizationManager, PersonalizationManager>();

            services.AddSingleton<ITokenGenerator, TokenGenerator>();
            services.AddSingleton<IHostVerificationTokenHelper, HostVerificationTokenHelper>();
            services.AddSingleton<IRandomSecretGenerator, RandomSecretGenerator>();

            services.AddSingleton<ILanguageRepository, LanguageRepository>();
            services.AddSingleton<IClientLanguageService, ClientLanguageService>();

            services.AddSingleton<IHorizonWorkflowManager, HorizonWorkflowManager>();
            services.AddSingleton<IHorizonItemTreeBuilder, HorizonItemTreeBuilder>();
            services.AddSingleton<ISaveArgsBuilder, SaveArgsBuilder>();

            services.AddSingleton<IPublishingTimelineProvider, PublishingTimelineProvider>();
            services.AddSingleton<IPublishingRangeHelper, PublishingRangeHelper>();

            services.AddSingleton<IHorizonCspManager, HorizonCspManager>();

            services.AddSingleton<IHorizonPipelines, HorizonPipelines>();
            services.AddSingleton<HorizonPipelineDefinitions>();

            services.AddSingleton<IHashEncryption, HashEncryption>();

            // Pipelines
            services.AddSingleton<BuildHorizonPageExtendersPipeline>();
            services.AddSingleton<BuildItemPublishingPipeline>();
            services.AddSingleton<GetItemLayoutDataSourcesPipeline>();
            services.AddSingleton<HorizonMoveItemPipeline>();
            services.AddSingleton<HorizonSaveItemPipeline>();
            services.AddSingleton<PopulateRawTimelineMetadataPipeline>();
            services.AddSingleton<ResolveHorizonModePipeline>();
        }
    }
}
