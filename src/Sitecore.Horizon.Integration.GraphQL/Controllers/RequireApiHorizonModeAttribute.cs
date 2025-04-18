// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Net;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Sitecore.DependencyInjection;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.GraphQL.Controllers
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    internal sealed class RequireApiHorizonModeAttribute : ActionFilterAttribute
    {
        private readonly LazyResetable<IHorizonInternalContext> _horizonContext;

        public RequireApiHorizonModeAttribute() : this(ServiceLocator.GetRequiredResetableService<IHorizonInternalContext>())
        {
        }

        private RequireApiHorizonModeAttribute(LazyResetable<IHorizonInternalContext> horizonContext)
        {
            Assert.ArgumentNotNull(horizonContext, nameof(horizonContext));

            _horizonContext = horizonContext;
        }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            Assert.ArgumentNotNull(actionContext, nameof(actionContext));

            HeadlessMode mode = _horizonContext.Value.GetHeadlessMode();

            if (mode != HeadlessMode.Api)
            {
                string message = $"Require API Horizon mode. Current mode: {mode}. Ensure that request URL contains 'SC_Headless_Mode=api' in query string.";

                actionContext.Response = actionContext.Request.CreateErrorResponse(HttpStatusCode.BadRequest, message);
            }
        }
    }
}
