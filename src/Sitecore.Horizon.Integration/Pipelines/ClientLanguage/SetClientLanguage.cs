// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Specialized;
using System.Web;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Pipelines.GetStartUrl;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.ClientLanguage
{
    internal class SetClientLanguage : GetStartUrlProcessor
    {
        public const string HeadlessModeKey = "sc_headless_mode";

        private readonly IClientLanguageService _clientLanguageService;

        public SetClientLanguage(IClientLanguageService clientLanguageService)
        {
            _clientLanguageService = clientLanguageService;
        }

        public override void Process(GetStartUrlArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            if (args.Result == null || !args.AppendClientLanguage || !args.Site.IsBackend)
            {
                return;
            }

            if (!IsStartUrlRequestHorizonMode(args))
            {
                return;
            }

            _clientLanguageService.SetClientLanguage(args.User.Profile.ClientLanguage);

            static bool IsStartUrlRequestHorizonMode(GetStartUrlArgs args)
            {
                NameValueCollection returnUrlQueryStringParams = HttpUtility.ParseQueryString(args.Result.Query);
                string? horizonModeQueryStringValue = returnUrlQueryStringParams.Get(HeadlessModeKey);
                return horizonModeQueryStringValue != null && HeadlessRequestState.Parse(horizonModeQueryStringValue!).Mode != HeadlessMode.Disabled;
            }
        }
    }
}
