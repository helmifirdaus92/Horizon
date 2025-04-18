// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Security;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.GraphQL.Queries
{
    internal class HorizonConfigurationQueries : ObjectGraphType
    {
        private readonly IHostVerificationTokenHelper _tokenHelper;
        private readonly IClientLanguageService _clientLanguageService;
        private readonly BaseSettings _baseSetting;

        public HorizonConfigurationQueries(IHostVerificationTokenHelper tokenHelper, IClientLanguageService clientLanguageService, BaseSettings baseSetting)
        {
            Assert.ArgumentNotNull(baseSetting, nameof(baseSetting));

            _tokenHelper = tokenHelper;
            _clientLanguageService = clientLanguageService;
            _baseSetting = baseSetting;

            // Is not being actually used.
            Name = nameof(HorizonConfigurationQueries);

            Field<NonNullGraphType<PlatformConfigurationGraphType>>(
                "configuration",
                resolve: _ => GetConfiguration(),
                description: "Information about platform configuration"
            );
        }

        private PlatformConfigurationGraphType GetConfiguration()
        {
            return new PlatformConfigurationGraphType()
            {
                AdditionalPlatformUrls = Enumerable.Empty<Uri>(),
                HostVerificationToken = _tokenHelper.BuildHostVerificationToken(),
                ContentRootItemId = ItemIDs.ContentRoot.Guid,
                ClientLanguage = _clientLanguageService.GetClientLanguage(),
                SessionTimeoutSeconds = WebUtil.GetSessionTimeout().TotalSeconds.ToString(CultureInfo.InvariantCulture),
                JssEditingSecret = _baseSetting.Horizon().JssEditingSecret,
                PersonalizeScope = _baseSetting.Horizon().PersonalizeScope,
                GlobalTagsRepository = _baseSetting.Horizon().GlobalTagsRepository,
                EnvironmentFeatures = new Dictionary<string, bool>()
                {
                    ["xmTenant_use-ckeditor"] = _baseSetting.Horizon().EnableCKEditor,
                    ["xmTenant_components-testing"] = _baseSetting.Horizon().EnableComponentsTesting,
                    ["xmTenant_optimize-content"] = _baseSetting.Horizon().EnableOptimizeContent
                }
            };
        }
    }
}
