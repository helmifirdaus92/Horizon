// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using GraphQL.Types;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.JavaScriptServices.Configuration;
using Sitecore.Sites;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class SiteGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldMapSimpleProperties(SiteGraphType sut, SiteContext siteContext, string name, string language, string rootPath, string startItem, bool enableWebEdit)
        {
            // arrange
            siteContext.Name.Returns(name);
            siteContext.Language.Returns(language);
            siteContext.RootPath.Returns(rootPath);
            siteContext.StartItem.Returns(startItem);
            siteContext.EnableWebEdit.Returns(enableWebEdit);

            // act & assert
            sut.Should().ResolveFieldValueTo("name", siteContext.Name, c => c.WithSource(siteContext));
            sut.Should().ResolveFieldValueTo("language", language, c => c.WithSource(siteContext));
            sut.Should().ResolveFieldValueTo("rootPath", siteContext.RootPath, c => c.WithSource(siteContext));
            sut.Should().ResolveFieldValueTo("startPath", siteContext.StartPath, c => c.WithSource(siteContext));
            sut.Should().ResolveFieldValueTo("enableWebEdit", siteContext.EnableWebEdit, c => c.WithSource(siteContext));
        }

        [Theory, AutoNData]
        internal void RootItem_ShouldReturnRootPathItem([Frozen] IHorizonItemHelper itemHelper, SiteGraphType sut, SiteContext siteContext, string rootPath, Item item)
        {
            // arrange
            siteContext.RootPath.Returns(rootPath);
            siteContext.Language.Returns("uk-UA");
            itemHelper.Configure().GetItem(rootPath).Returns(item);

            // act
            // assert
            sut.Should().ResolveFieldValueTo("rootItem", item, c => c.WithSource(siteContext));
        }

        [Theory, AutoNData]
        internal void RootItem_ShouldSetSpecifiedLanguageContext([Frozen] IHorizonItemHelper itemHelper, SiteGraphType sut, SiteContext siteContext, string rootPath)
        {
            // arrange
            Language contextLanguage = null;
            itemHelper.When(x => x.GetItem(Any.String)).Do(c => contextLanguage = Sitecore.Context.Language);

            siteContext.RootPath.Returns(rootPath);
            siteContext.Language.Returns("da-DK");

            // act
            sut.ResolveFieldValue(
                "rootItem",
                c => c
                    .WithArg("language", "uk-UA")
                    .WithSource(siteContext));

            // assert
            contextLanguage.Name.Should().Be("uk-UA");
        }

        [Theory, AutoNData]
        internal void RootItem_ShouldSetSiteLanguageAsContextContext([Frozen] IHorizonItemHelper itemHelper, SiteGraphType sut, SiteContext siteContext, string rootPath)
        {
            // arrange
            Language contextLanguage = null;
            itemHelper.When(x => x.GetItem(Any.String)).Do(_ => contextLanguage = Sitecore.Context.Language);

            siteContext.RootPath.Returns(rootPath);
            siteContext.Language.Returns("uk-UA");

            // act
            sut.ResolveFieldValue("rootItem", c => c.WithSource(siteContext));

            // assert
            contextLanguage.Name.Should().Be("uk-UA");
        }

        [Theory, AutoNData]
        internal void StartItem_ShouldReturnRootPathItem([Frozen] IHorizonItemHelper itemHelper, SiteGraphType sut, SiteContext siteContext, string startPath, Item item)
        {
            // arrange
            siteContext.StartPath.Returns(startPath);
            siteContext.Language.Returns("uk-UA");
            itemHelper.Configure().GetItem(startPath).Returns(item);

            // act
            // assert
            sut.Should().ResolveFieldValueTo("startItem", item, c => c.WithSource(siteContext));
        }

        [Theory, AutoNData]
        internal void StartItem_ShouldSetSpecifiedLanguageContext([Frozen] IHorizonItemHelper itemHelper, SiteGraphType sut, SiteContext siteContext, string startPath)
        {
            // arrange
            Language contextLanguage = null;
            itemHelper.When(x => x.GetItem(Any.String)).Do(_ => contextLanguage = Sitecore.Context.Language);

            siteContext.StartPath.Returns(startPath);
            siteContext.Language.Returns("da-DK");

            // act
            sut.ResolveFieldValue(
                "startItem",
                c => c
                    .WithArg("language", "uk-UA")
                    .WithSource(siteContext));

            // assert
            contextLanguage.Name.Should().Be("uk-UA");
        }

        [Theory, AutoNData]
        internal void StartItem_ShouldSetSiteLanguageAsContextContext([Frozen] IHorizonItemHelper itemHelper, SiteGraphType sut, SiteContext siteContext, string startPath)
        {
            // arrange
            Language contextLanguage = null;
            itemHelper.When(x => x.GetItem(Any.String)).Do(_ => contextLanguage = Sitecore.Context.Language);

            siteContext.StartPath.Returns(startPath);
            siteContext.Language.Returns("uk-UA");

            // act
            sut.ResolveFieldValue("startItem", c => c.WithSource(siteContext));

            // assert
            contextLanguage.Name.Should().Be("uk-UA");
        }

        [Theory, AutoNData]
        internal void ShouldResolveLayoutServiceConfig(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IConfigurationResolver configurationResolver,
            [Frozen] string layoutServiceConfig,
            SiteGraphType sut,
            SiteContext siteContext,
            Item item,
            string startPath)
        {
            // arrange
            siteContext.StartItem.Returns(startPath);
            itemHelper.Configure().GetItem(startPath).Returns(item);

            AppConfiguration appConfiguration = new AppConfiguration { LayoutServiceConfiguration = layoutServiceConfig };
            configurationResolver.Configure().ResolveForItem(item).Returns(appConfiguration);

            // act
            // assert
            sut.Should().ResolveFieldValueTo("layoutServiceConfig", layoutServiceConfig, c => c.WithSource(siteContext));
        }

        [Theory, AutoNData]
        internal void ShouldResolveRenderingEngineEndpointUrl(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IConfigurationResolver configurationResolver,
            [Frozen] string renderingEngineEndpointUrl,
            SiteGraphType sut,
            SiteContext siteContext,
            Item item,
            string startPath)
        {
            // arrange
            siteContext.StartItem.Returns(startPath);
            itemHelper.Configure().GetItem(startPath).Returns(item);

            AppConfiguration appConfiguration = new AppConfiguration { ServerSideRenderingEngineEndpointUrl = renderingEngineEndpointUrl };
            configurationResolver.Configure().ResolveForItem(item).Returns(appConfiguration);

            // act
            // assert
            sut.Should().ResolveFieldValueTo("renderingEngineEndpointUrl", renderingEngineEndpointUrl, c => c.WithSource(siteContext));
        }

        [Theory, AutoNData]
        internal void ShouldResolveRenderingEngineApplicationUrl(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IConfigurationResolver configurationResolver,
            [Frozen] string renderingEngineApplicationUrl,
            SiteGraphType sut,
            SiteContext siteContext,
            Item item,
            string startPath)
        {
            // arrange
            siteContext.StartItem.Returns(startPath);
            itemHelper.Configure().GetItem(startPath).Returns(item);

            AppConfiguration appConfiguration = new AppConfiguration { ServerSideRenderingEngineApplicationUrl = renderingEngineApplicationUrl };
            configurationResolver.Configure().ResolveForItem(item).Returns(appConfiguration);

            // act
            // assert
            sut.Should().ResolveFieldValueTo("renderingEngineApplicationUrl", renderingEngineApplicationUrl, c => c.WithSource(siteContext));
        }

        [Theory, AutoNData]
        internal void ShouldResolveAppName(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IConfigurationResolver configurationResolver,
            [Frozen] string appName,
            SiteGraphType sut,
            SiteContext siteContext,
            Item item,
            string startPath)
        {
            // arrange
            siteContext.StartItem.Returns(startPath);
            itemHelper.Configure().GetItem(startPath).Returns(item);

            AppConfiguration appConfiguration = new AppConfiguration { Name = appName };
            configurationResolver.Configure().ResolveForItem(item).Returns(appConfiguration);

            // act
            // assert
            sut.Should().ResolveFieldValueTo("appName", appName, c => c.WithSource(siteContext));
        }
    }
}
