// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using AutoFixture.Xunit2;
using NSubstitute;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.PreAuthenticateRequest;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Pipelines.HttpRequest;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.PreAuthenticateRequest
{
    public class RegisterIFrameAllowedDomainsTests
    {
        [Theory, AutoNData]
        internal void Process_ShouldWriteHeaderWithRegisteredDomains(
            [Frozen] IHorizonCspManager cspManager,
            RegisterIFrameAllowedDomains sut,
            HttpContextBase contextBase)
        {
            // arrange
            var args = new HttpRequestArgs(contextBase);

            // act
            sut.Process(args);

            // assert
            cspManager.Received().AddFrameAncestors(contextBase);
        }
    }
}
