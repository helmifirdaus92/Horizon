// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Media;
using Sitecore.Horizon.Integration.Media.Models;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.AutoFixture;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Media
{
    public class HorizonMediaManagerTests
    {
        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaItem_ShouldResolveItemById([Frozen] IHorizonItemHelper itemHelper, HorizonMediaManager sut, Item item, Item sourceItem)
        {
            // arrange
            itemHelper.IsMediaItem(Any.Item).ReturnsTrue();

            string itemId = item.ID.ToString();
            string sourceId = sourceItem.ID.ToString();
            item.Paths.IsDescendantOf(sourceItem).Returns(true);

            // act
            MediaItem result = sut.GetMediaItem(itemId, ToArray(sourceId));

            // assert
            result.InnerItem.Should().Be(item);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaItem_ShouldResolveItemByFullPath([Frozen] IHorizonItemHelper itemHelper, HorizonMediaManager sut, Item item, Item sourceItem)
        {
            // arrange
            itemHelper.IsMediaItem(Any.Item).ReturnsTrue();

            string itemPath = item.Paths.FullPath;
            string sourcePath = sourceItem.Paths.FullPath;
            item.Paths.IsDescendantOf(sourceItem).Returns(true);

            // act
            MediaItem result = sut.GetMediaItem(itemPath, ToArray(sourcePath));

            // assert
            result.InnerItem.Should().Be(item);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaItem_ShouldFailIfSourcesAreSpecifiedButAnyCannotBeFound(
            [Frozen] IHorizonItemHelper itemHelper,
            HorizonMediaManager sut,
            Item item,
            string nonExistingSourcePath,
            Item existingSource)
        {
            // arrange
            itemHelper.IsMediaItem(Any.Item).ReturnsTrue();

            string itemId = item.ID.ToString();
            item.Paths.IsDescendantOf(Any.Item).ReturnsFalse();

            // act & assert
            sut.Invoking(s => s.GetMediaItem(itemId, ToArray(nonExistingSourcePath, existingSource.ID.ToString())))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.SourceNotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaItem_ShouldUseMediaLibraryAsSourceIfSourcesAreNotSpecified(
            [Frozen] IHorizonItemHelper itemHelper,
            HorizonMediaManager sut,
            Database db,
            Item item)
        {
            // arrange
            itemHelper.IsMediaItem(Any.Item).ReturnsTrue();

            var mediaLibraryRoot = new FakeItem(ItemIDs.MediaLibraryRoot, db).ToSitecoreItem();
            item.Database.GetItem(ItemIDs.MediaLibraryRoot).Returns(mediaLibraryRoot);
            item.Paths.IsDescendantOf(mediaLibraryRoot).Returns(true);

            // act
            var result = sut.GetMediaItem(item.ID.ToString(), Array.Empty<string>());

            // assert
            result.InnerItem.Should().Be(item);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaItem_ShouldTryToResolveRelativePath([Frozen] IHorizonItemHelper itemHelper,
            HorizonMediaManager sut,
            Database db,
            Item item,
            Item sourceItem,
            string relativePath)
        {
            // arrange
            itemHelper.IsMediaItem(item).ReturnsTrue();

            db.GetItem($"/sitecore/media library/{relativePath}").Returns(item);
            item.Paths.IsDescendantOf(sourceItem).Returns(true);

            // act
            MediaItem result = sut.GetMediaItem(relativePath, ToArray(sourceItem.ID.ToString()));

            // assert
            result.InnerItem.Should().Be(item);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaItem_ShouldThrowErrorIfCannotResolveItem(HorizonMediaManager sut, string path)
        {
            // act & assert
            sut.Invoking(s => s.GetMediaItem(path, Array.Empty<string>()))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.NotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaItem_ShouldThrowErrorIfItemIsNotAMedia([Frozen] IHorizonItemHelper itemHelper, HorizonMediaManager sut, Item item)
        {
            // arrange
            itemHelper.IsMediaItem(Any.Item).ReturnsFalse();

            // act
            sut.Invoking(s => s.GetMediaItem(item.ID.ToString(), Array.Empty<string>()))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.NotAMedia);
        }


        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetItem_ShouldReturnErrorIfItemIsNotDescendantOfSources(Database db,
            HorizonMediaManager sut, Item source1, Item source2)
        {
            // arrange
            var item = new FakeItem(ItemIDs.MediaLibraryRoot, db).ToSitecoreItem();
            item.Paths.IsDescendantOf(source1).Returns(false);
            item.Paths.IsDescendantOf(source2).Returns(false);

            // act
            sut.Invoking(s => s.GetMediaItem(item.ID.ToString(), ToArray(source1.ID.ToString(), source2.ID.ToString())))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.SourceNotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderItem_ShouldResolveMediaFolderItemById([Frozen] IHorizonItemHelper itemHelper,
            HorizonMediaManager sut,
            Item item)
        {
            // arrange
            itemHelper.IsMediaFolder(Any.Item).ReturnsTrue();
            string itemId = item.ID.ToString();

            // act
            var result = sut.GetMediaFolderItem(itemId);

            // assert
            result.Should().Be(item);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderItem_ShouldResolveFolderItemById([Frozen] IHorizonItemHelper itemHelper,
            HorizonMediaManager sut,
            Item item)
        {
            // arrange
            itemHelper.IsFolder(Any.Item).ReturnsTrue();
            string itemId = item.ID.ToString();

            // act
            var result = sut.GetMediaFolderItem(itemId);

            // assert
            result.Should().Be(item);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderItem_ShouldReturnErrorIfItemIsNotAFolderNorAMediaFolder([Frozen] IHorizonItemHelper itemHelper,
            HorizonMediaManager sut,
            Item item)
        {
            // arrange
            itemHelper.IsMediaFolder(Any.Item).ReturnsFalse();
            itemHelper.IsFolder(Any.Item).ReturnsFalse();

            // act & assert
            sut.Invoking(s => s.GetMediaFolderItem(item.ID.ToString()))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.NotAFolder);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderItem_ShouldReturnErrorIfCannotResolveFolderItem(HorizonMediaManager sut, string path)
        {
            // act & assert
            sut.Invoking(s => s.GetMediaFolderItem(path))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.NotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderAncestors_ShouldReturnAncestors(
            [Frozen] IHorizonItemTreeBuilder itemTreeBuilder,
            HorizonMediaManager sut,
            IEnumerable<Item> ancestors,
            Item item,
            Item source)
        {
            // arrange
            itemTreeBuilder.TryBuildMediaFolderAncestorsTree(item, Any.Arg<Item[]>()).Returns(ancestors);

            // act
            var result = sut.GetMediaFolderAncestors(item.ID.ToString(), ToArray(source.ID.ToString()));

            // assert
            result.Should().Equal(ancestors);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderAncestors_ShouldUseMediaLibraryAsSourceIfSourcesAreNotSpecified(
            [Frozen] IHorizonItemTreeBuilder itemTreeBuilder,
            HorizonMediaManager sut,
            Database db,
            IEnumerable<Item> ancestors,
            Item item)
        {
            // arrange
            var mediaLibraryRoot = new FakeItem(ItemIDs.MediaLibraryRoot, db).ToSitecoreItem();

            itemTreeBuilder.TryBuildMediaFolderAncestorsTree(Any.Item, Any.ArrayWithContent(mediaLibraryRoot)).Returns(ancestors);

            // act
            var result = sut.GetMediaFolderAncestors(item.ID.ToString(), Array.Empty<string>());

            // assert
            result.Should().Equal(ancestors);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderAncestors_ShouldReturnErrorIfAncestorsTreeIsNotReachable(
            [Frozen] IHorizonItemTreeBuilder itemTreeBuilder,
            HorizonMediaManager sut,
            Item item,
            Item source)
        {
            // arrange
            itemTreeBuilder.TryBuildMediaFolderAncestorsTree(item, Any.Arg<Item[]>()).Returns((IEnumerable<Item>)null);

            // act & assert
            sut.Invoking(s => s.GetMediaFolderAncestors(item.ID.ToString(), ToArray(source.ID.ToString())))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.SourceNotReachable);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderAncestors_ShouldReturnErrorIfCannotResolveFolderItem(HorizonMediaManager sut, string path)
        {
            // act
            sut.Invoking(s => s.GetMediaFolderAncestors(path, Array.Empty<string>()))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.NotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void GetMediaFolderAncestors_ShouldFailIfSourceIsSpecifiedButAnySourceCannotBeFound(Database db,
            HorizonMediaManager sut,
            string nonExistingSourcePath,
            Item existingSource)
        {
            // arrange
            var item = new FakeItem(ItemIDs.MediaLibraryRoot, db).ToSitecoreItem();

            // act
            sut.Invoking(s => s.GetMediaFolderAncestors(item.ID.ToString(), ToArray(nonExistingSourcePath, existingSource.ID.ToString())))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.SourceNotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldCreateMediaItemThroughMediaUploader(
            [Frozen] IMediaUploader mediaUploader,
            HorizonMediaManager sut,
            UploadMediaModel uploadMedia,
            MediaItem item)
        {
            // arrange
            mediaUploader.Configure().CreateMedia(uploadMedia).Returns(item);

            // act
            var result = sut.CreateMedia(uploadMedia);

            // assert
            result.Should().Be(item);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_NoSearchCriteria_ShouldUseRoot([Frozen] IMediaSearcher mediaSearcher, HorizonMediaManager sut, Database db, Item rootItem, Item source)
        {
            // arrange
            rootItem.Paths.IsDescendantOf(source).Returns(true);

            // act
            _ = sut.QueryMedia(root: rootItem.ID.ToString(), sources: ToArray(source.ID.ToString()), query: null, baseTemplateIds: null);

            // assert
            mediaSearcher.Received().GetAllMediaItems(Any.ArrayWithContent(rootItem), null, Any.Language, Any.Int);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_HasSearchCriteria_ShouldUseRoot([Frozen] IMediaSearcher mediaSearcher, HorizonMediaManager sut, Database db, string query, Item rootItem, Item source)
        {
            // arrange
            rootItem.Paths.IsDescendantOf(source).Returns(true);

            // act
            _ = sut.QueryMedia(query: query, root: rootItem.ID.ToString(), sources: ToArray(source.ID.ToString()), baseTemplateIds: null);

            // assert
            mediaSearcher.Received().SearchMediaItems(Any.String, Any.ArrayWithContent(rootItem), null, Any.Language, Any.Int);
        }

        [Theory]
        [InlineAutoNData("")]
        [InlineAutoNData("some query")]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_ShouldFailIfRootIsSpecifiedButCannotBeFound(string query, HorizonMediaManager sut, Database db, string nonExistingItemRoot)
        {
            // arrange
            var mediaLibraryRoot = new FakeItem(ItemIDs.MediaLibraryRoot, db).ToSitecoreItem();

            // act
            sut.Invoking(s => s.QueryMedia(query: query, root: nonExistingItemRoot, sources: Array.Empty<string>(), baseTemplateIds: null))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.RootNotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_ShouldUseBaseTemplateIdsIfSpecified(
          [Frozen] IMediaSearcher mediaSearcher,
          HorizonMediaManager sut,
           Item source1,
           Item source2,
          string templ1,
          string templ2)
        {
            // act
            sut.QueryMedia(query: null, root: null, sources: ToArray(source1.ID.ToString(), source2.ID.ToString()), baseTemplateIds: ToArray(templ1, templ2));

            // assert
            mediaSearcher.Received().GetAllMediaItems(Arg.Any<Item[]>(), Any.ArrayWithContent(templ1, templ2), Any.Language, Any.Int);
        }

        [Theory]
        [InlineAutoNData("some query")]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_ShouldFailIfSourcesAreSpecifiedButAnySourceCannotBeFound(string query, HorizonMediaManager sut, Database db, string nonExistingSourcePath, Item existingSource)
        {
            // arrange
            // act
            sut.Invoking(s => s.QueryMedia(query: query, root: null, sources: ToArray(nonExistingSourcePath, existingSource.Paths.FullPath), baseTemplateIds: null))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.SourceNotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_ShouldSearchMediaItemIfRootIsAnyOfSources(
            [Frozen] IMediaSearcher mediaSearcher,
            HorizonMediaManager sut,
            string query,
            Item item,
            Item otherSource)
        {
            // arrange
            // act
            _ = sut.QueryMedia(query: query, root: item.ID.ToString(), sources: ToArray(item.ID.ToString(), otherSource.Paths.FullPath), baseTemplateIds: null);

            // assert
            mediaSearcher.Received().SearchMediaItems(Any.String, Any.Arg<Item[]>(), null, Any.Language, Any.Int);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_NoSearchCriteria_ShouldUseSourceIfSourceIsSpecified(
            [Frozen] IMediaSearcher mediaSearcher,
            HorizonMediaManager sut,
            Item source1,
            Item source2
        )
        {
            // arrange
            // act
            sut.QueryMedia(query: null, root: null, sources: ToArray(source1.ID.ToString(), source2.ID.ToString()), baseTemplateIds: null);

            // assert
            mediaSearcher.Received().GetAllMediaItems(Any.ArrayWithContent(source1, source2), null, Any.Language, Any.Int);
        }
               

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_HasSearchCriteria_ShouldUseMediaLibraryIfSourceAndRootAreNotSpecified(
            [Frozen] IMediaSearcher mediaSearcher,
            HorizonMediaManager sut,
            Database db,
            string query)
        {
            // arrange
            var mediaLibraryItem = new FakeItem(ItemIDs.MediaLibraryRoot, db).ToSitecoreItem();

            // act
            sut.QueryMedia(query: query, root: null, sources: Array.Empty<string>(), baseTemplateIds: null);

            // assert
            mediaSearcher.Received().SearchMediaItems(Any.String, Any.ArrayWithContent(mediaLibraryItem), null, Any.Language, Any.Int);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_HasSearchCriteria_ShouldUseMediaLibraryIfSourceIsNotSpecified([Frozen] IMediaSearcher mediaSearcher, HorizonMediaManager sut, Database db, string query)
        {
            // arrange
            var mediaLibraryItem = new FakeItem(ItemIDs.MediaLibraryRoot, db).ToSitecoreItem();

            // act
            sut.QueryMedia(query: query, root: null, sources: Array.Empty<string>(), baseTemplateIds: null);

            // assert
            mediaSearcher.Received().SearchMediaItems(Any.String, Any.ArrayWithContent(mediaLibraryItem), null, Any.Language, Any.Int);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_HasSearchCriteria_ShouldUseQuery(
            [Frozen] IMediaSearcher mediaSearcher,
            HorizonMediaManager sut,
            string query,
            Item rootItem,
            Item source)
        {
            // arrange
            rootItem.Paths.IsDescendantOf(source).Returns(true);

            // act
            _ = sut.QueryMedia(query: query, root: rootItem.ID.ToString(), sources: ToArray(source.ID.ToString()), baseTemplateIds: null);

            // assert
            mediaSearcher.Received().SearchMediaItems(query, Any.Arg<Item[]>(), null, Any.Language, Any.Int);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_NoSearchCriteria_ShouldHaveCorrectLimitByDefault([Frozen] IMediaSearcher mediaSearcher, HorizonMediaManager sut, Item source, Item rootItem)
        {
            // arrange
            rootItem.Paths.IsDescendantOf(source).Returns(true);

            // act
            sut.QueryMedia(sources: ToArray(source.ID.ToString()), root: rootItem.ID.ToString(), query: null, baseTemplateIds: null);

            // assert
            mediaSearcher.Received().GetAllMediaItems(Any.Arg<Item[]>(), null, Any.Language, 500);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void QueryMedia_HasSearchCriteria_ShouldHaveCorrectLimitByDefault([Frozen] IMediaSearcher mediaSearcher, HorizonMediaManager sut, string query, Item source, Item rootItem)
        {
            // arrange
            rootItem.Paths.IsDescendantOf(source).Returns(true);

            // act
            sut.QueryMedia(query: query, sources: ToArray(source.ID.ToString()), root: rootItem.ID.ToString(), baseTemplateIds: null);

            // assert
            mediaSearcher.Received().SearchMediaItems(Any.String, Any.Arg<Item[]>(), null, Any.Language, 500);
        }

        private static T[] ToArray<T>(params T[] elements) => elements;

        public class StableHorizonItemHelper : ICustomization
        {
            public void Customize(IFixture fixture)
            {
                var itemHelper = fixture.Freeze<IHorizonItemHelper>();
                var db = fixture.Create<Database>();

                itemHelper.GetItem(Any.ID, Arg.Any<ItemScope>()).Returns(c => db.GetItem(c.Arg<ID>()));
                itemHelper.GetItem(Any.String, Arg.Any<ItemScope>()).Returns(c => db.GetItem(c.Arg<string>()));
            }
        }
    }
}
