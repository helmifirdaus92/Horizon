// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using System.Web.UI;
using Sitecore.DependencyInjection;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Layouts;
using Sitecore.Layouts.PageExtenders;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Layouts
{
    [UsedInConfiguration]
    internal class HorizonPageExtender : PageExtender
    {
        private readonly LazyResetable<ISitecoreContext> _sitecoreContext;
        private readonly LazyResetable<IHorizonInternalContext> _horizonContext;
        private readonly LazyResetable<IHorizonPipelines> _horizonPipelines;

        public HorizonPageExtender()
            : this(
                ServiceLocator.GetRequiredResetableService<ISitecoreContext>(),
                ServiceLocator.GetRequiredResetableService<IHorizonInternalContext>(),
                ServiceLocator.GetRequiredResetableService<IHorizonPipelines>())
        {
        }

        public HorizonPageExtender(LazyResetable<ISitecoreContext> sitecoreContext, LazyResetable<IHorizonInternalContext> horizonContext, LazyResetable<IHorizonPipelines> horizonPipelines)
        {
            _sitecoreContext = sitecoreContext;
            _horizonContext = horizonContext;
            _horizonPipelines = horizonPipelines;
        }

        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", Justification = "Resource is unnecessary for logs.")]
        [SuppressMessage("Microsoft.Reliability", "CA2000:Dispose objects before losing scope", Justification = "Don't need dispose here.")]
        public override void Insert()
        {
            HeadlessMode mode = _horizonContext.Value.GetHeadlessMode();
            if (mode is HeadlessMode.Disabled or HeadlessMode.Api)
            {
                return;
            }

            var args = BuildHorizonPageExtendersArgs.Create();
            _horizonPipelines.Value.BuildHorizonPageExtenders(ref args);

            string bodyContent = args.BodyContent.ToString();
            if (string.IsNullOrEmpty(bodyContent))
            {
                return;
            }

            PageContext pageContext = _sitecoreContext.Value.Page ?? throw new InvalidOperationException("Page context should not be null.");

            pageContext.AddRendering(
                new RenderingReference(new LiteralControl(bodyContent))
                {
                    AddToFormIfUnused = true
                });
        }
    }
}
