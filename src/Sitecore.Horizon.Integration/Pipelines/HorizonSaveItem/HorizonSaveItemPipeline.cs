// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Data.Clones.ItemSourceUriProviders;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Presentation;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    internal class HorizonSaveItemPipeline : IHorizonPipeline<HorizonSaveItemArgs>
    {
        public HorizonSaveItemPipeline(ISourceUriProvider itemSourceUriProvider,
            ISitecoreContext scContext,
            IPresentationDetailsRepository presentationDetailsRepository,
            BaseSettings settings,
            BaseTranslate translate,
            BaseTemplateManager templateManager,
            BaseLog log)
        {
            Processors = new IHorizonPipelineProcessor<HorizonSaveItemArgs>[]
            {
                new CheckItemLock(scContext),
                new CheckFieldModified(scContext, presentationDetailsRepository),
                new CheckCloneSource(itemSourceUriProvider, settings, scContext),
                new HasWritePermission(scContext),
                new NewVersion(),
                new TightenRelativeImageLinks(scContext),
                new CheckLock(scContext, templateManager),
                new Lock(scContext, log),
                new CheckBaseTemplateFieldChange(scContext),
                new CheckTemplateFieldChange(scContext),
                new ConvertLayoutField(scContext),
                new Save(translate, log, scContext),
                new Unlock(scContext, log),
                new WorkflowSaveCommand(scContext),
                new SyncSavedItemsRevisions(scContext)
            };
        }

        public IHorizonPipelineProcessor<HorizonSaveItemArgs>[] Processors { get; }
    }
}
