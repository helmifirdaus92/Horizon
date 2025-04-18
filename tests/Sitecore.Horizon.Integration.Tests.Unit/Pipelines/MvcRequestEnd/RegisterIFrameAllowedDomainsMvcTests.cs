// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using System.Web.Routing;
using AutoFixture.Xunit2;
using NSubstitute;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.MvcRequestEnd;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Mvc.Pipelines.Request.RequestEnd;
using Sitecore.Mvc.Presentation;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.MvcRequestEnd
{
    public class RegisterIFrameAllowedDomainsMvcTests
    {
        [Theory]
        [InlineAutoNData(HeadlessMode.Edit)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void Process_ShouldWriteHeaderWithRegisteredDomains(HeadlessMode mode,
            [Frozen] IHorizonCspManager cspManager,
            [Frozen] IHorizonInternalContext horizonContext,
            RegisterIFrameAllowedDomainsMvc sut,
            HttpContextBase contextBase)
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(mode);

            var args = new RequestEndArgs
            {
                PageContext = new PageContext
                {
                    RequestContext = new RequestContext
                    {
                        HttpContext = contextBase
                    }
                }
            };

            // act
            sut.Process(args);

            // assert
            cspManager.Received().AddFrameAncestors(contextBase);
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        internal void Process_ShouldSkipWhenHorizonModeIsDisabledOrApi(
            HeadlessMode mode,
            [Frozen] IHorizonCspManager cspManager,
            [Frozen] IHorizonInternalContext horizonContext,
            RegisterIFrameAllowedDomainsMvc sut,
            HttpContextBase contextBase)
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(mode);

            var args = new RequestEndArgs
            {
                PageContext = new PageContext
                {
                    RequestContext = new RequestContext
                    {
                        HttpContext = contextBase
                    }
                }
            };

            // act
            sut.Process(args);

            // assert
            cspManager.DidNotReceive().AddFrameAncestors(contextBase);
        }
    }
}
