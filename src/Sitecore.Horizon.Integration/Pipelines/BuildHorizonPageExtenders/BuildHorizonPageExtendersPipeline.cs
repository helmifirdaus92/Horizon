// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Horizon.Integration.Security;
using Sitecore.SecurityModel.Cryptography;

namespace Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders
{
    internal class BuildHorizonPageExtendersPipeline : IHorizonPipeline<BuildHorizonPageExtendersArgs>
    {
        public BuildHorizonPageExtendersPipeline(IHorizonInternalContext horizonContext,
            ICanvasMessageFactory canvasMessageFactory,
            IPresentationDetailsRepository presentationDetailsRepository,
            IHostVerificationTokenHelper tokenHelper,
            ISitecoreContext scContext,
            IHashEncryption hashEncryption)
        {
            Processors = new IHorizonPipelineProcessor<BuildHorizonPageExtendersArgs>[]
            {
                new AddHorizonCanvasState(horizonContext, canvasMessageFactory),
                new AddHorizonClientScript(hashEncryption, horizonContext),
                new AddHorizonPresentationDetailsJson(horizonContext, scContext, presentationDetailsRepository, canvasMessageFactory),
                new AddHostVerificationToken(horizonContext, scContext, tokenHelper, canvasMessageFactory),
                new AddHorizonEditorExtenders(horizonContext)
            };
        }

        public IHorizonPipelineProcessor<BuildHorizonPageExtendersArgs>[] Processors { get; }
    }
}
