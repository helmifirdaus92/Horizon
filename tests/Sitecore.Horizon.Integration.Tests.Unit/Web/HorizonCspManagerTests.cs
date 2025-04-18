// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Web
{
    public class HorizonCspManagerTests
    {

        [Theory, AutoNData]
        internal void ShouldAddConfiguredDomain(BaseCorePipelineManager pipelineManager, HttpContextBase context, string allowedDomain)
        {
            //act
            pipelineManager.Horizon().CollectIFrameAllowedDomains(Arg.Do<CollectIFrameAllowedDomainsArgs>(x => x.AllowedDomains.Add(allowedDomain)));

            var sut = new HorizonCspManager(pipelineManager);
            sut.AddFrameAncestors(context);

            //assert
            context.Response.Headers["Content-Security-Policy"].Should().Contain(allowedDomain);
        }


        [Theory, AutoNData]
        internal void ShouldOnlyAddCspWithFrameAncestorsHeaderOnce(BaseCorePipelineManager pipelineManager, [Frozen] HttpContextBase context, string allowedDomain)
        {
            //arrange
            pipelineManager.Horizon().CollectIFrameAllowedDomains(Arg.Do<CollectIFrameAllowedDomainsArgs>(x => x.AllowedDomains.Add(allowedDomain)));

            //act
            var sut = new HorizonCspManager(pipelineManager);
            sut.AddFrameAncestors(context);
            sut.AddFrameAncestors(context);

            //assert
            context.Response.Headers.AllKeys.Count(key => key == "Content-Security-Policy").Should().Be(1);
            context.Response.Headers["Content-Security-Policy"].Should().Contain(allowedDomain);
        }

        [Theory, AutoNData]
        internal void ShouldNotOverWriteCspInHeader(BaseCorePipelineManager pipelineManager, [Frozen] HttpContextBase context, string allowedDomain)
        {
            //arrange
            pipelineManager.Horizon().CollectIFrameAllowedDomains(Arg.Do<CollectIFrameAllowedDomainsArgs>(x => x.AllowedDomains.Add(allowedDomain)));

            //act
            context.Response.Headers.Add("Content-Security-Policy", "default-src 'self'");
            var sut = new HorizonCspManager(pipelineManager);
            sut.AddFrameAncestors(context);

            //assert
            context.Response.Headers.AllKeys.Count(key => key == "Content-Security-Policy").Should().Be(1);
            context.Response.Headers["Content-Security-Policy"].Should().Contain(allowedDomain);
            context.Response.Headers["Content-Security-Policy"].Should().Contain("default-src 'self'");
        }
    }
}
