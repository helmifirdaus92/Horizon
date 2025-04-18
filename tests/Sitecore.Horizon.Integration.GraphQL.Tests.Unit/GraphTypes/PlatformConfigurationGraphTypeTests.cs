// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections;
using System.Collections.Generic;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class PlatformConfigurationGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(PlatformConfigurationGraphType sut,
            PlatformConfigurationGraphType platformConfigurationGraphType,
            IEnumerable<Uri> additionalPlatformUrls,
            Guid contentRootItemId,
            Guid layoutServiceApiKey,
            string hostVerificationToken,
            string clientLanguage,
            string sessionTimeoutSeconds,
            string integrationVersion,
            string jssEditingSecret
            )
        {
            // arrange
            platformConfigurationGraphType.AdditionalPlatformUrls = additionalPlatformUrls;
            platformConfigurationGraphType.HostVerificationToken = hostVerificationToken;
            platformConfigurationGraphType.ContentRootItemId = contentRootItemId;
            platformConfigurationGraphType.ClientLanguage = clientLanguage;
            platformConfigurationGraphType.SessionTimeoutSeconds = sessionTimeoutSeconds;
            platformConfigurationGraphType.IntegrationVersion = integrationVersion;
            platformConfigurationGraphType.JssEditingSecret = jssEditingSecret;

            // act & assert
            sut.Should().ResolveFieldValueTo("additionalPlatformUrls", additionalPlatformUrls, c => c.WithSource(platformConfigurationGraphType));
            sut.Should().ResolveFieldValueTo("hostVerificationToken", hostVerificationToken, c => c.WithSource(platformConfigurationGraphType));
            sut.Should().ResolveFieldValueTo("contentRootItemId", contentRootItemId, c => c.WithSource(platformConfigurationGraphType));
            sut.Should().ResolveFieldValueTo("sessionTimeoutSeconds", sessionTimeoutSeconds, c => c.WithSource(platformConfigurationGraphType));
            sut.Should().ResolveFieldValueTo("clientLanguage", clientLanguage, c => c.WithSource(platformConfigurationGraphType));
            sut.Should().ResolveFieldValueTo("integrationVersion", integrationVersion, c => c.WithSource(platformConfigurationGraphType));
            sut.Should().ResolveFieldValueTo("jssEditingSecret", jssEditingSecret, c => c.WithSource(platformConfigurationGraphType));
        }
    }
}
