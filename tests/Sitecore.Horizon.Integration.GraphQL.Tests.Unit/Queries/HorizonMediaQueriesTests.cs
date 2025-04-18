// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using NSubstitute.Extensions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Queries;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Media;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Queries
{
    public class HorizonMediaQueriesTests
    {
        [Theory, AutoNData]
        internal void MediaItem_ShouldReturnItemFromManager([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, MediaItem mediaItem, string path, string[] sources)
        {
            // arrange
            mediaManager.Configure().GetMediaItem(path, sources).Returns(mediaItem);

            // act
            var result = sut.ResolveFieldValue<MediaItem>(
                "mediaItem",
                c => c
                    .WithArg("path", path)
                    .WithArg("sources", sources)
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Should().Be(mediaItem);
        }

        [Theory, AutoNData]
        internal void MediaItem_ShouldSetContext([Frozen] ISitecoreContext scContext, HorizonMediaQueries sut, string path, string[] sources)
        {
            // act
            var result = sut.ResolveFieldValue<MediaItem>(
                "mediaItem",
                c => c
                    .WithArg("path", path)
                    .WithArg("sources", sources)
                    .WithLangAndSiteArgs("uk-UA", "testSite")
            );

            // assert
            scContext.Received().SetLanguage(Any.LanguageWithName("uk-UA"), Any.Bool);
            scContext.Received().SetActiveSite("testSite");
        }

        [Theory, AutoNData]
        internal void MediaItem_ShouldRethrowMediaError([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, string path, string[] sources, MediaErrorCode mediaErrorCode)
        {
            // arrange
            mediaManager.GetMediaItem(Any.String, Any.Arg<string[]>()).Throws(new HorizonMediaException(mediaErrorCode));

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("mediaItem", c => c.WithArg("path", path).WithArg("sources", sources).WithLangAndSiteArgs()))
                .Should().Throw<HorizonGqlError>().WithErrorCode(mediaErrorCode);
        }

        [Theory, AutoNData]
        internal void MediaItem_ShouldRethrowGenericError([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, string path, string[] sources)
        {
            // arrange
            mediaManager.GetMediaItem(Any.String, Any.Arg<string[]>()).Throws<InvalidOperationException>();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("mediaItem", c => c.WithArg("path", path).WithArg("sources", sources).WithLangAndSiteArgs()))
                .Should().Throw<HorizonGqlError>().WithErrorCode(GenericErrorCodes.UnknownError);
        }

        [Theory, AutoNData]
        internal void MediaQuery_ShouldReturnResultFromManager([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, MediaQueryResult queryResult, string query, string root, string[] sources, string[] baseTemplateIds)
        {
            // arrange
            mediaManager.Configure().QueryMedia(query, root, sources, baseTemplateIds).Returns(queryResult);

            // act
            var result = sut.ResolveFieldValue<MediaQueryResult>(
                "mediaQuery",
                c => c
                    .WithArg("query", query)
                    .WithArg("root", root)
                    .WithArg("sources", sources)
                    .WithArg("baseTemplateIds", baseTemplateIds)
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Should().Be(queryResult);
        }

        [Theory, AutoNData]
        internal void MediaQuery_ShouldSetContext([Frozen] ISitecoreContext scContext, HorizonMediaQueries sut, string[] sources)
        {
            // act
            var result = sut.ResolveFieldValue(
                "mediaQuery",
                c => c
                    .WithArg("sources", sources)
                    .WithLangAndSiteArgs("uk-UA", "testSite")
            );

            // assert
            scContext.Received().SetLanguage(Any.LanguageWithName("uk-UA"), Any.Bool);
            scContext.Received().SetActiveSite("testSite");
        }

        [Theory, AutoNData]
        internal void MediaQuery_ShouldRethrowMediaError([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, string[] sources, MediaErrorCode mediaErrorCode)
        {
            // arrange
            mediaManager.QueryMedia(Any.String, Any.String, Any.Arg<string[]>(), Any.Arg<string[]>()).Throws(new HorizonMediaException(mediaErrorCode));

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("mediaQuery", c => c.WithArg("sources", sources).WithLangAndSiteArgs()))
                .Should().Throw<HorizonGqlError>().WithErrorCode(mediaErrorCode);
        }

        [Theory, AutoNData]
        internal void MediaQuery_ShouldRethrowGenericError([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, string[] sources)
        {
            // arrange
            mediaManager.QueryMedia(Any.String, Any.String, Any.Arg<string[]>(), Any.Arg<string[]>()).Throws<InvalidOperationException>();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("mediaQuery", c => c.WithArg("sources", sources).WithLangAndSiteArgs()))
                .Should().Throw<HorizonGqlError>().WithErrorCode(GenericErrorCodes.UnknownError);
        }

        [Theory, AutoNData]
        internal void MediaFolderItem_ShouldReturnResultFromManager([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, Item folderItem, string path)
        {
            // arrange
            mediaManager.Configure().GetMediaFolderItem(path).Returns(folderItem);

            // act
            var result = sut.ResolveFieldValue<Item>(
                "mediaFolderItem",
                c => c
                    .WithArg("path", path)
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Should().Be(folderItem);
        }

        [Theory, AutoNData]
        internal void MediaFolderItem_ShouldReturnMediaLibraryRootIfPathNotSpecified([Frozen] IHorizonItemHelper itemHelper, HorizonMediaQueries sut, Item mediaLibraryRoot)
        {
            // arrange
            itemHelper.Configure().GetItem(ItemIDs.MediaLibraryRoot, ItemScope.MediaOnly).Returns(mediaLibraryRoot);

            // act
            var result = sut.ResolveFieldValue<Item>(
                "mediaFolderItem",
                c => c
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Should().Be(mediaLibraryRoot);
        }

        [Theory, AutoNData]
        internal void MediaFolderItem_ShouldSetContext([Frozen] ISitecoreContext scContext, HorizonMediaQueries sut)
        {
            // act
            var result = sut.ResolveFieldValue(
                "mediaFolderItem",
                c => c
                    .WithLangAndSiteArgs("uk-UA", "testSite")
            );

            // assert
            scContext.Received().SetLanguage(Any.LanguageWithName("uk-UA"), Any.Bool);
            scContext.Received().SetActiveSite("testSite");
        }

        [Theory, AutoNData]
        internal void MediaFolderItem_ShouldRethrowMediaError([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, string path, MediaErrorCode mediaErrorCode)
        {
            // arrange
            mediaManager.GetMediaFolderItem(Any.String).Throws(new HorizonMediaException(mediaErrorCode));

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("mediaFolderItem", c => c.WithArg("path", path).WithLangAndSiteArgs()))
                .Should().Throw<HorizonGqlError>().WithErrorCode(mediaErrorCode);
        }

        [Theory, AutoNData]
        internal void MediaFolderItem_ShouldRethrowGenericError([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, string path)
        {
            // arrange
            mediaManager.GetMediaFolderItem(Any.String).Throws<InvalidOperationException>();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("mediaFolderItem", c => c.WithArg("path", path).WithLangAndSiteArgs()))
                .Should().Throw<HorizonGqlError>().WithErrorCode(GenericErrorCodes.UnknownError);
        }

        [Theory, AutoNData]
        internal void MediaFolderAncestors_ShouldReturnResultFromManager([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, IEnumerable<Item> ancestors, string path, string[] sources)
        {
            // arrange
            mediaManager.Configure().GetMediaFolderAncestors(path, sources).Returns(ancestors);

            // act
            var result = sut.ResolveFieldValue<IEnumerable<Item>>(
                "mediaFolderAncestors",
                c => c
                    .WithArg("path", path)
                    .WithArg("sources", sources)
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Should().Equal(ancestors);
        }

        [Theory, AutoNData]
        internal void MediaFolderAncestors_ShouldSetContext([Frozen] ISitecoreContext scContext, HorizonMediaQueries sut, string path, string[] sources)
        {
            // act
            var result = sut.ResolveFieldValue(
                "mediaFolderAncestors",
                c => c
                    .WithArg("path", path)
                    .WithArg("sources", sources)
                    .WithLangAndSiteArgs("uk-UA", "testSite")
            );

            // assert
            scContext.Received().SetLanguage(Any.LanguageWithName("uk-UA"), Any.Bool);
            scContext.Received().SetActiveSite("testSite");
        }

        [Theory, AutoNData]
        internal void MediaFolderAncestors_ShouldRethrowMediaError([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, string path, string[] sources, MediaErrorCode mediaErrorCode)
        {
            // arrange
            mediaManager.GetMediaFolderAncestors(Any.String, Any.Arg<string[]>()).Throws(new HorizonMediaException(mediaErrorCode));

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("mediaFolderAncestors", c => c.WithArg("path", path).WithArg("sources", sources).WithLangAndSiteArgs()))
                .Should().Throw<HorizonGqlError>().WithErrorCode(mediaErrorCode);
        }

        [Theory, AutoNData]
        internal void MediaFolderAncestors_ShouldRethrowGenericError([Frozen] IHorizonMediaManager mediaManager, HorizonMediaQueries sut, string path, string[] sources)
        {
            // arrange
            mediaManager.GetMediaFolderAncestors(Any.String, Any.Arg<string[]>()).Throws<InvalidOperationException>();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue("mediaFolderAncestors", c => c.WithArg("path", path).WithArg("sources", sources).WithLangAndSiteArgs()))
                .Should().Throw<HorizonGqlError>().WithErrorCode(GenericErrorCodes.UnknownError);
        }
    }
}
