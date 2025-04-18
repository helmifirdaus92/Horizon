// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.IO;
using System.Text;
using System.Web.Routing;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.IO;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Pipelines.MvcRequestEnd;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Mvc.Pipelines.Request.RequestEnd;
using Sitecore.Mvc.Presentation;
using Sitecore.Security.Accounts;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.MvcRequestEnd;

public class RenderHorizonPageExtendersTests
{
    [Theory] [AutoNData]
    internal void Process_ShouldSkipWhenResponseFilterIsNull(
        [Frozen] IHorizonPipelines horizonPipelines,
        [Frozen] IHorizonInternalContext horizonContext,
        RenderHorizonPageExtenders sut,
        RequestContext requestContext)
    {
        // arrange
        horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);
        requestContext.HttpContext.Response.Filter.ReturnsNull();

        RequestEndArgs args = new RequestEndArgs
        {
            PageContext = new PageContext
            {
                RequestContext = requestContext
            }
        };

        // act
        sut.Process(args);

        // assert
        horizonPipelines.DidNotReceive().BuildHorizonPageExtenders(ref Arg.Any<BuildHorizonPageExtendersArgs>());
    }

    [Theory] [AutoNData]
    internal void Process_ShouldSkipWhenContentIsEmpty(
        [Frozen] IHorizonPipelines horizonPipelines,
        [Frozen] IHorizonInternalContext horizonContext,
        RenderHorizonPageExtenders sut,
        RequestContext requestContext)
    {
        // arrange
        horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);
        requestContext.HttpContext.Response.Filter.Returns(new MemoryStream());

        RequestEndArgs args = new RequestEndArgs
        {
            PageContext = new PageContext
            {
                RequestContext = requestContext
            }
        };

        // act
        sut.Process(args);

        // assert
        requestContext.HttpContext.Response.Filter.Should().BeOfType<MemoryStream>();
    }

    [Theory] [AutoNData]
    internal void Process_ShouldRegisterFilterWhenContentIsNotEmpty(
        [Frozen] IHorizonPipelines horizonPipelines,
        [Frozen] IHorizonInternalContext horizonContext,
        RenderHorizonPageExtenders sut,
        RequestContext requestContext,
        string content)
    {
        // arrange
        horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);
        requestContext.HttpContext.Response.Filter.Returns(new MemoryStream());
        requestContext.HttpContext.Response.ContentEncoding.Returns(Encoding.UTF8);

        horizonPipelines.BuildHorizonPageExtenders(ref Any.ArgDo((ref BuildHorizonPageExtendersArgs x) => x.BodyContent.Append(content)));

        RequestEndArgs args = new RequestEndArgs
        {
            PageContext = new PageContext
            {
                RequestContext = requestContext
            }
        };

        // act
        sut.Process(args);

        // assert
        ResponseFilterStream filter = requestContext.HttpContext.Response.Filter as ResponseFilterStream;

        filter.Should().NotBeNull();
        filter.BodyContent.Should().Be(content);
    }

    [Theory]
    [InlineAutoNData(HeadlessMode.Disabled)]
    [InlineAutoNData(HeadlessMode.Api)]
    internal void Process_ShouldSkipWhenHorizonModeIsDisabledOrApi(
        HeadlessMode mode,
        [Frozen] IHorizonPipelines horizonPipelines,
        [Frozen] IHorizonInternalContext horizonContext,
        RenderHorizonPageExtenders sut,
        RequestContext requestContext)
    {
        // arrange
        horizonContext.GetHeadlessMode().Returns(mode);
        requestContext.HttpContext.Response.Filter.Returns(new MemoryStream());

        RequestEndArgs args = new RequestEndArgs
        {
            PageContext = new PageContext
            {
                RequestContext = requestContext
            }
        };

        // act
        sut.Process(args);

        // assert
        horizonPipelines.DidNotReceive().BuildHorizonPageExtenders(ref Any.Arg<BuildHorizonPageExtendersArgs>());
    }

    [Theory] [AutoNData]
    internal void Process_ShouldSkipWhenUserIsNotAuthenticated(
        [Frozen] IHorizonPipelines horizonPipelines,
        [Frozen] IHorizonInternalContext horizonContext,
        [Frozen] ISitecoreContext sitecoreContext,
        RenderHorizonPageExtenders sut,
        RequestContext requestContext,
        User user)
    {
        // arrange
        horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);
        requestContext.HttpContext.Response.Filter.Returns(new MemoryStream());

        user.IsAuthenticated.ReturnsFalse();
        sitecoreContext.Configure().User.Returns(user);

        RequestEndArgs args = new RequestEndArgs
        {
            PageContext = new PageContext
            {
                RequestContext = requestContext
            }
        };

        // act
        sut.Process(args);

        // assert
        horizonPipelines.DidNotReceive().BuildHorizonPageExtenders(ref Any.Arg<BuildHorizonPageExtendersArgs>());
    }
}
