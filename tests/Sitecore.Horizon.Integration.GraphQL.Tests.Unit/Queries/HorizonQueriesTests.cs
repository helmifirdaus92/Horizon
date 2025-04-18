// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Collections;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Queries;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Security.Accounts;
using Sitecore.Sites;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Queries
{
    public class HorizonQueriesTests
    {
        [Theory, AutoNData]
        internal void User_ShouldReturnContextUser([Frozen] ISitecoreContext scContext, HorizonQueries sut, User user)
        {
            // arrange
            scContext.User = user;

            // act
            var result = sut.ResolveFieldValue<User>("user");

            // assert
            result.Should().Be(user);
        }

        [Theory, AutoNData]
        internal void Languages_ShouldReturnLanguagesFromLanguageRepo([Frozen] ILanguageRepository langRepo, HorizonQueries sut, LanguageCollection languages)
        {
            // arrange
            langRepo.GetLanguages().Returns(languages);

            // act
            var result = sut.ResolveFieldValue<LanguageCollection>("languages");

            // assert
            result.Should().Equal(languages);
        }

        [Theory, AutoNData]
        internal void Sites_ShouldReturnAllSites([Frozen] IHorizonSiteManager siteManager, HorizonQueries sut, IEnumerable<SiteContext> sites)
        {
            // arrange
            siteManager.GetAllSites(Any.Bool).Returns(sites);

            // act
            var result = sut.ResolveFieldValue<IEnumerable<SiteContext>>("sites");

            // assert
            result.Should().Equal(sites);
            siteManager.Received().GetAllSites(includeSystemSites: false);
        }

        [Theory, AutoNData]
        internal void Sites_ShouldReturnSiteByNameIfSpecified([Frozen] IHorizonSiteManager siteManager, HorizonQueries sut, string siteName, SiteContext site)
        {
            // arrange
            siteManager.Configure().GetSiteByName(siteName).Returns(site);

            // act
            var result = sut.ResolveFieldValue<IEnumerable<SiteContext>>("sites", c => c.WithArg("name", siteName));

            // assert
            result.Should().Equal(site);
        }

        [Theory, AutoNData]
        internal void Sites_ShouldReturnEmptyListIfSiteNotFound([Frozen] IHorizonSiteManager siteManager, HorizonQueries sut, string siteName)
        {
            // arrange
            siteManager.Configure().GetSiteByName(siteName).ReturnsNull();

            // act
            var result = sut.ResolveFieldValue<IEnumerable<SiteContext>>("sites", c => c.WithArg("name", siteName));

            // assert
            result.Should().BeEmpty();
        }

        [Theory, AutoNData]
        internal void Sites_ShouldSetFilteringContext([Frozen] ISitecoreContext scContext, HorizonQueries sut, string siteName, SiteContext siteContext)
        {
            // arrange
            scContext.Configure().Site.Returns(siteContext);
            siteContext.DisableFiltering = false;

            // act
            var result = sut.ResolveFieldValue(
                "sites",
                c => c
                    .WithArg("name", siteName)
                    .WithArg("enableItemFiltering", false));

            // assert
            siteContext.DisableFiltering.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void Item_ShouldReturnContentItem([Frozen] IHorizonItemHelper itemHelper, HorizonQueries sut, Item item, string path)
        {
            // arrange
            itemHelper.Configure().GetItem(path, ItemScope.ContentOnly).Returns(item);

            // act
            var result = sut.ResolveFieldValue<Item>(
                "item",
                c => c
                    .WithArg("path", path)
                    .WithLangAndSiteArgs());

            // assert
            result.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void Item_ShouldReturnContentItemVersion([Frozen] IHorizonItemHelper itemHelper, HorizonQueries sut, Item item, string path, int version)
        {
            // arrange
            itemHelper.Configure().GetItem(path, Version.Parse(version), ItemScope.ContentOnly).Returns(item);

            // act
            var result = sut.ResolveFieldValue<Item>(
                "item",
                c => c
                    .WithArg("path", path)
                    .WithArg("version", version)
                    .WithLangAndSiteArgs());

            // assert
            result.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void Item_ShouldThrowErrorIfItemNotFound([Frozen] IHorizonItemHelper itemHelper, HorizonQueries sut, string path)
        {
            // arrange
            itemHelper.Configure().GetItem(path).ReturnsNull();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue(
                    "item",
                    c => c.WithArg("path", path)
                        .WithLangAndSiteArgs())
                )
                .Should().Throw<HorizonGqlError>().WithErrorCode(ItemErrorCode.ItemNotFound);
        }

        [Theory, AutoNData]
        internal void Item_ShouldSetContext([Frozen] IHorizonItemHelper itemHelper, [Frozen] ISitecoreContext scContext, HorizonQueries sut, string site, string path, Item item)
        {
            // arrange
            itemHelper.Configure().GetItem(path).Returns(item);
            var queryContext = new HorizonQueryContext();

            // act
            sut.ResolveFieldValue(
                "item",
                c => c
                    .WithLangAndSiteArgs("be-BY", site)
                    .WithArg("path", path)
                    .WithQueryContext(queryContext));

            // assert
            scContext.Received().SetActiveSite(site);
            scContext.Received().SetDisplayMode(Any.Arg<SiteContext>(), DisplayMode.Edit, DisplayModeDuration.Temporary);
            scContext.Received().SetLanguage(Arg.Is<Language>(l => l.Name == "be-BY"), Any.Bool);
            scContext.Received().SetDevice(itemHelper.DefaultDevice);
            queryContext.ContextItem.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void Item_ShouldSetSubContextToHorizonOnlyItem(HorizonQueries sut, string path)
        {
            // arrange
            var queryContext = new HorizonQueryContext();

            // act
            sut.ResolveFieldValue(
                "item",
                c => c
                    .WithArg("path", path)
                    .WithLangAndSiteArgs()
                    .WithQueryContext(queryContext));

            // assert
            queryContext.HorizonOnlyItems.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void RawItem_ShouldReturnAnyItem([Frozen] IHorizonItemHelper itemHelper, HorizonQueries sut, Item item, string path)
        {
            // arrange
            itemHelper.Configure().GetItem(path, Arg.Any<ItemScope>()).Returns(item);

            // act
            var result = sut.ResolveFieldValue<Item>(
                "rawItem",
                c => c
                    .WithArg("path", path)
                    .WithLangAndSiteArgs());

            // assert
            result.Should().Be(item);
            itemHelper.Received().GetItem(Any.String, ItemScope.AllRootsItem);
        }

        [Theory, AutoNData]
        internal void RawItem_ShouldThrowErrorIfItemNotFound([Frozen] IHorizonItemHelper itemHelper, HorizonQueries sut, string path)
        {
            // arrange
            itemHelper.Configure().GetItem(path, Any.Arg<ItemScope>()).ReturnsNull();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue(
                    "rawItem",
                    c => c.WithArg("path", path)
                        .WithLangAndSiteArgs())
                )
                .Should().Throw<HorizonGqlError>().WithErrorCode(ItemErrorCode.ItemNotFound);
        }

        [Theory, AutoNData]
        internal void RawItem_ShouldSetContext([Frozen] IHorizonItemHelper itemHelper, [Frozen] ISitecoreContext scContext, HorizonQueries sut, string site, string path, Item item)
        {
            // arrange
            itemHelper.Configure().GetItem(path, Any.Arg<ItemScope>()).Returns(item);
            var queryContext = new HorizonQueryContext();

            // act
            sut.ResolveFieldValue(
                "rawItem",
                c => c
                    .WithLangAndSiteArgs("be-BY", site)
                    .WithArg("path", path)
                    .WithQueryContext(queryContext));

            // assert
            scContext.Received().SetActiveSite(site);
            scContext.Received().SetDisplayMode(Any.Arg<SiteContext>(), DisplayMode.Edit, DisplayModeDuration.Temporary);
            scContext.Received().SetLanguage(Arg.Is<Language>(l => l.Name == "be-BY"), Any.Bool);
            scContext.Received().SetDevice(itemHelper.DefaultDevice);
            queryContext.ContextItem.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void RawItem_ShouldSetSubContextToAllItems(HorizonQueries sut, string path)
        {
            // arrange
            var queryContext = new HorizonQueryContext();

            // act
            sut.ResolveFieldValue(
                "rawItem",
                c => c
                    .WithArg("path", path)
                    .WithLangAndSiteArgs()
                    .WithQueryContext(queryContext));

            // assert
            queryContext.HorizonOnlyItems.Should().BeFalse();
        }
    }
}
