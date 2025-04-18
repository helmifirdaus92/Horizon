// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data;
using Sitecore.Data.Engines;
using Sitecore.Data.Items;
using Sitecore.Data.Templates;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.Links;
using Sitecore.Links.UrlBuilders;
using Sitecore.NSubstituteUtils;
using Xunit;
using Version = Sitecore.Data.Version;

namespace Sitecore.Horizon.Integration.Tests.Unit.Items
{
    public class HorizonItemHelperTests
    {
        [Theory, AutoNData]
        internal void DefaultDevice_ShouldReturnDefaultDevice(
            BaseTemplateManager templateManager,
            BaseSettings settings,
            ISitecoreContext context,
            BaseLinkManager linkManager,
            BaseItemManager baseItemManager
        )
        {
            //arrange
            Item defaultDeviceItem = new FakeItem(HorizonItemHelper.DefaultDeviceId, context.Database);
            context.Database.GetItem(HorizonItemHelper.DefaultDeviceId).Returns(defaultDeviceItem);

            var sut = new HorizonItemHelper(templateManager, settings, context, linkManager, baseItemManager);

            //act
            var result = sut.DefaultDevice;

            //assert
            result.ID.Should().Be(HorizonItemHelper.DefaultDeviceId);
            result.InnerItem.Should().Be(defaultDeviceItem);
        }

        [Theory, AutoNData]
        internal void IsHorizonItem_ShouldReturnTrueIfFolder(
            Item item,
            HorizonItemHelper sut
        )
        {
            //arrange 
            var folderId = new ID("{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}");
            item.TemplateID.Returns(folderId);

            //act
            var result = sut.IsHorizonItem(item);

            //assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsHorizonItem_ShouldReturnFalseIfSxaPresentationFolder(
            [Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            [Frozen] TemplateEngine templateEngine,
            Item item,
            Template.Builder templateBuilder)
        {
            // arrange
            templateBuilder.SetBaseIDs(TemplateIDs.Folder.ToString());
            var itemTemplate = templateBuilder.Template;

            item.AsFake().WithTemplate(HorizonItemHelper.SxaPresentationFolderId);
            templateManager.GetTemplate(item).Returns(itemTemplate);

            var folderItemBaseTemplate = new Template.Builder("FolderTemplate", TemplateIDs.Folder, templateEngine).Template;
            templateEngine.Configure().GetTemplate(folderItemBaseTemplate.ID).Returns(folderItemBaseTemplate);

            //act
            var result = sut.IsHorizonItem(item);

            //assert
            result.Should().BeFalse();
        }

        [Theory, AutoNData]
        internal void IsHorizonItem_ShouldThrowOnNullItem(HorizonItemHelper sut)
        {
            //act & assert
            sut.Invoking(handler => handler.IsHorizonItem(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void IsMediaItem_ShouldNotBeConsideredMediaIfPathIsNotInMediaLibrary([Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            Item item)
        {
            // arrange
            item.Paths.IsMediaItem.ReturnsFalse();
            item.AsFake().WithTemplate(TemplateIDs.VersionedImage);

            // act
            var result = sut.IsMediaItem(item);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [InlineAutoNData("{C97BA923-8009-4858-BDD5-D8BE5FCCECF7}" /* TemplateIDs.VersionedImage */)]
        [InlineAutoNData("{F1828A2C-7E5D-4BBD-98CA-320474871548}" /* TemplateIDs.UnversionedImage */)]
        internal void IsMediaItem_ShouldBeConsideredMediaWhenTemplateIsMediaId(string templateIdRaw,
            [Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            Item item)
        {
            // arrange
            var template = new Template.Builder("Media", ID.Parse(templateIdRaw), new TemplateCollection()).Template;
            templateManager.Configure().GetTemplate(item).Returns(template);

            item.Paths.IsMediaItem.ReturnsTrue();

            // act
            var result = sut.IsMediaItem(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [InlineAutoNData("{C97BA923-8009-4858-BDD5-D8BE5FCCECF7}" /* TemplateIDs.VersionedImage */)]
        [InlineAutoNData("{F1828A2C-7E5D-4BBD-98CA-320474871548}" /* TemplateIDs.UnversionedImage */)]
        internal void IsMediaItem_ShouldBeConsideredMediaWhenInheritedFromMediaTemplate(string mediaTemplateIdRaw,
            [Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            [Frozen] TemplateEngine templateEngine,
            Item item,
            Template.Builder templateBuilder)
        {
            // arrange
            templateBuilder.SetBaseIDs(mediaTemplateIdRaw);
            var itemTemplate = templateBuilder.Template;

            item.AsFake().WithTemplate(itemTemplate.ID);
            templateManager.GetTemplate(item).Returns(itemTemplate);

            var imageBaseTemplate = new Template.Builder("ImageTemplate", ID.Parse(mediaTemplateIdRaw), templateEngine).Template;
            templateEngine.Configure().GetTemplate(imageBaseTemplate.ID).Returns(imageBaseTemplate);

            item.Paths.IsMediaItem.Returns(true);

            // act
            var result = sut.IsMediaItem(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsSxaPresentationFolder_ShouldBeConsideredSxaPresentationFolderWhenTemplateIdMatchesSxaPresentationFolder(
            HorizonItemHelper sut,
            Item item)
        {
            // arrange
            item.TemplateID.Returns(HorizonItemHelper.SxaPresentationFolderId);

            // act
            var result = sut.IsSxaPresentationFolder(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsSxaPresentationFolder_ShouldNotBeConsideredSxaPresentationFolderWhenTemplateIdDoesNotMatchSxaPresentationFolder(
            HorizonItemHelper sut,
            Item item)
        {
            // act
            var result = sut.IsSxaPresentationFolder(item);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [InlineAutoNData("{611933AC-CE0C-4DDC-9683-F830232DB150}" /* TemplateIDs.VersionedFile */)]
        [InlineAutoNData("{962B53C4-F93B-4DF9-9821-415C867B8903}" /* TemplateIDs.UnversionedFile */)]
        internal void GetItem_ShouldNotBeConsideredMediaWhenTemplateIsFileId(string templateIdRaw,
            [Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            Item item)
        {
            // arrange
            var template = new Template.Builder("Media", ID.Parse(templateIdRaw), new TemplateCollection()).Template;
            templateManager.Configure().GetTemplate(item).Returns(template);

            item.Paths.IsMediaItem.ReturnsTrue();

            // act
            var result = sut.IsMediaItem(item);

            // assert
            result.Should().BeFalse();
        }

        [Theory, AutoNData]
        internal void IsMediaFolder_ShouldBeConsideredMediaFolderWhenBasedOnMediaFolderTemplate(
            HorizonItemHelper sut,
            Item item)
        {
            // arrange
            item.AsFake().WithTemplate(TemplateIDs.MediaFolder);

            // act
            var result = sut.IsMediaFolder(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsMediaFolder_ShouldBeConsideredMediaFolderWhenItemIdIsMediaLibraryRoot(
            HorizonItemHelper sut)
        {
            // arrange
            var item = new FakeItem(ItemIDs.MediaLibraryRoot).ToSitecoreItem();

            // act
            var result = sut.IsMediaFolder(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsMediaFolder_ShouldNotBeConsideredMediaFolderWhenItemIdIsNotMediaLibraryRootOrNotBasedOnMediaFolderTemplate(
            HorizonItemHelper sut,
            Item item)
        {
            // act
            var result = sut.IsMediaFolder(item);

            // assert
            result.Should().BeFalse();
        }

        [Theory, AutoNData]
        internal void IsMediaFolder_ShouldBeConsideredMediaFolderWhenInheritedFromMediaFolderTemplate(
            [Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            [Frozen] TemplateEngine templateEngine,
            Item item,
            Template.Builder templateBuilder)
        {
            // arrange
            templateBuilder.SetBaseIDs(TemplateIDs.MediaFolder.ToString());
            var itemTemplate = templateBuilder.Template;

            item.AsFake().WithTemplate(itemTemplate.ID);
            templateManager.GetTemplate(item).Returns(itemTemplate);

            var mediaFolderBaseTemplate = new Template.Builder("ImageFolderTemplate", TemplateIDs.MediaFolder, templateEngine).Template;
            templateEngine.Configure().GetTemplate(mediaFolderBaseTemplate.ID).Returns(mediaFolderBaseTemplate);

            // act
            var result = sut.IsMediaFolder(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsMediaFolder_ShouldThrowOnNullItem(HorizonItemHelper sut)
        {
            //act & assert
            sut.Invoking(s => s.IsMediaFolder(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void IsFolder_ShouldBeConsideredFolderWhenBasedOnFolderTemplate(
            HorizonItemHelper sut,
            Item item)
        {
            // arrange
            item.AsFake().WithTemplate(TemplateIDs.Folder);

            // act
            var result = sut.IsFolder(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsFolder_ShouldBeConsideredFolderWhenInheritedFromFolderTemplate(
            [Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            [Frozen] TemplateEngine templateEngine,
            Item item,
            Template.Builder templateBuilder)
        {
            // arrange
            templateBuilder.SetBaseIDs(TemplateIDs.Folder.ToString());
            var itemTemplate = templateBuilder.Template;

            item.AsFake().WithTemplate(itemTemplate.ID);
            templateManager.GetTemplate(item).Returns(itemTemplate);

            var folderItemBaseTemplate = new Template.Builder("FolderTemplate", TemplateIDs.Folder, templateEngine).Template;
            templateEngine.Configure().GetTemplate(folderItemBaseTemplate.ID).Returns(folderItemBaseTemplate);

            // act
            var result = sut.IsFolder(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsFolder_ShouldThrowOnNullItem(HorizonItemHelper sut)
        {
            //act & assert
            sut.Invoking(s => s.IsFolder(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory]
        [InlineAutoNData("{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}" /* Folder */)]
        [InlineAutoNData("{7EE0975B-0698-493E-B3A2-0B2EF33D0522}" /* RenderingFolder */)]
        [InlineAutoNData("{3BAA73E5-6BA9-4462-BF72-C106F8801B11}" /* SublayoutFolder */)]
        [InlineAutoNData("{239F9CF4-E5A0-44E0-B342-0F32CD4C6D8B}" /* Node */)]
        internal void IsPresentationFolder_ShouldBeConsideredPresentationFolderWhenBasedOnFolderAndRenderingFolderAndSublayoutFolderAndNodeTemplate(string templateIdRaw,
            HorizonItemHelper sut,
            Item item)
        {
            // arrange
            item.AsFake().WithTemplate(ID.Parse(templateIdRaw));

            // act
            var result = sut.IsPresentationFolder(item);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsPresentationFolder_ShouldThrowOnNullItem(HorizonItemHelper sut)
        {
            //act & assert
            sut.Invoking(s => s.IsPresentationFolder(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void IsBranchItemWithPresentation_ShouldReturnTrueIfBranchTemplateChildHasPresentation(
            [Frozen] ISitecoreContext sitecoreContext,
            HorizonItemHelper sut,
            TemplateItem templateItem,
            FakeItem branchItem,
            DeviceItem deviceItem,
            LayoutItem layoutItem)
        {
            // arrange
            sitecoreContext.Configure().Device.Returns(deviceItem);
            templateItem.InnerItem.TemplateID.Returns(TemplateIDs.BranchTemplate);
            branchItem.WithVisualization();
            templateItem.InnerItem.AsFake().WithChild(branchItem);
            branchItem.ToSitecoreItem().Visualization.GetLayout(deviceItem).Returns(layoutItem);

            // act
            var result = sut.IsBranchTemplateWithPresentation(templateItem);

            // assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsBranchItemWithPresentation_ShouldReturnFalseIfPassItemIsNotABranchTemplate(
            HorizonItemHelper sut,
            TemplateItem templateItem,
            FakeItem branchItem)
        {
            // arrange
            templateItem.InnerItem.TemplateID.Returns(TemplateIDs.Template);
            branchItem.WithVisualization();
            templateItem.InnerItem.AsFake().WithChild(branchItem);

            // act
            var result = sut.IsBranchTemplateWithPresentation(templateItem);

            // assert
            result.Should().BeFalse();
        }

        [Theory, AutoNData]
        internal void IsBranchItemWithPresentation_ShouldReturnFalseIfBranchTemplateHasNoChild(
            HorizonItemHelper sut,
            TemplateItem item)
        {
            // act
            var result = sut.IsBranchTemplateWithPresentation(item);

            // assert
            result.Should().BeFalse();
        }

        [Theory, AutoNData]
        internal void IsBranchItemWithPresentation_ShouldThrowOnNullItem(HorizonItemHelper sut)
        {
            //act & assert
            sut.Invoking(s => s.IsBranchTemplateWithPresentation(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void HasPresentation_ShouldThrowOnNullItem(HorizonItemHelper sut)
        {
            //act & assert
            sut.Invoking(handler => handler.HasPresentation(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void IsTemplateWithPresentation_ShouldReturnTrueIfHasPresentation(
            [Frozen] ISitecoreContext sitecoreContext,
            HorizonItemHelper sut,
            FakeItem insertOption,
            FakeItem standardValuesHolder,
            DeviceItem deviceItem,
            LayoutItem layoutItem
        )
        {
            //arrange
            sitecoreContext.Configure().Device.Returns(deviceItem);
            standardValuesHolder.WithVisualization();

            var templateItem = Substitute.For<TemplateItem>(insertOption.ToSitecoreItem());
            templateItem.InnerItem.TemplateID.Returns(TemplateIDs.Template);
            templateItem.StandardValues.Returns(standardValuesHolder);
            templateItem.StandardValues.Visualization.GetLayout(deviceItem).Returns(layoutItem);

            //act
            var result = sut.IsTemplateWithPresentation(templateItem);

            //assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsTemplateWithPresentation_ShouldReturnTrueIfBaseTemplateHasPresentationDetails(
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            [Frozen] TemplateEngine templateEngine,
            TemplateItem templateItem,
            ID baseTemplateIdA,
            ID baseTemplateIdB,
            FakeItem baseTemplateAStandardValues,
            DeviceItem deviceItem,
            LayoutItem layoutItem
        )
        {
            //arrange
            sitecoreContext.Configure().Device.Returns(deviceItem);
            templateItem.InnerItem.TemplateID.Returns(TemplateIDs.Template);
            var templateBuilder = new Template.Builder(templateItem.Name, templateItem.ID, templateEngine);
            templateBuilder.SetBaseIDs(ID.ArrayToString(new[]
            {
                baseTemplateIdA,
                baseTemplateIdB
            }));
            templateManager.GetTemplate(templateItem.ID, templateItem.Database).Returns(templateBuilder.Template);

            var baseTemplateBuilder = new Template.Builder("baseTemplateA", baseTemplateIdA, templateEngine);
            baseTemplateBuilder.SetStandardValueHolderId(baseTemplateAStandardValues.ID.ToString());
            templateEngine.Configure().GetTemplate(baseTemplateIdA).Returns(baseTemplateBuilder.Template);

            baseTemplateAStandardValues.WithVisualization();
            baseTemplateAStandardValues.ToSitecoreItem().Visualization.GetLayout(deviceItem).Returns(layoutItem);

            //act
            var result = sut.IsTemplateWithPresentation(templateItem);

            //assert
            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsTemplateWithPresentation_ShouldReturnFalseIfBaseTemplateHasNoPresentationDetails(
            [Frozen] BaseTemplateManager templateManager,
            HorizonItemHelper sut,
            [Frozen] TemplateEngine templateEngine,
            TemplateItem templateItem,
            ID baseTemplateIdA,
            ID baseTemplateIdB,
            FakeItem baseTemplateAStandardValues
        )
        {
            //arrange
            templateItem.InnerItem.TemplateID.Returns(TemplateIDs.Template);
            var templateBuilder = new Template.Builder(templateItem.Name, templateItem.ID, templateEngine);
            templateBuilder.SetBaseIDs(ID.ArrayToString(new[]
            {
                baseTemplateIdA,
                baseTemplateIdB
            }));

            templateManager.GetTemplate(templateItem.ID, templateItem.Database).Returns(templateBuilder.Template);

            var baseTemplateBuilder = new Template.Builder("baseTemplateA", baseTemplateIdA, templateEngine);
            baseTemplateBuilder.SetStandardValueHolderId(baseTemplateAStandardValues.ID.ToString());
            templateEngine.Configure().GetTemplate(baseTemplateIdA).Returns(baseTemplateBuilder.Template);
            baseTemplateAStandardValues.WithVisualization();
            baseTemplateAStandardValues.ToSitecoreItem().Visualization.GetLayout(Arg.Any<DeviceItem>()).Returns((LayoutItem)null);

            //act
            var result = sut.IsTemplateWithPresentation(templateItem);

            //assert
            result.Should().BeFalse();
        }

        [Theory, AutoNData]
        internal void DeleteItem_ShouldDeleteItemIfRecycleBinNotActive(
            [Frozen] BaseSettings settings,
            HorizonItemHelper sut,
            Item item
        )
        {
            //arrange
            settings.Core().RecycleBinActive.Returns(false);

            //act
            sut.DeleteItem(item);

            //assert
            item.Received().Delete();
        }

        [Theory, AutoNData]
        internal void DeleteItem_ShouldRecycleItemIfRecycleBinActive(
            [Frozen] BaseSettings settings,
            HorizonItemHelper sut,
            Item item
        )
        {
            //act
            settings.Core().RecycleBinActive.Returns(true);

            //act
            sut.DeleteItem(item);

            //assert
            item.Received().Recycle();
        }

        [Theory, AutoNData]
        internal void DeleteItemVersion_ShouldDeleteItemVersionIfRecycleBinNotActive(
            [Frozen] BaseSettings settings,
            HorizonItemHelper sut,
            FakeItem item
        )
        {
            //arrange
            item.WithItemVersions();
            Item sitecoreItem = item.ToSitecoreItem();

            settings.Core().RecycleBinActive.Returns(false);

            //act
            sut.DeleteItemVersion(sitecoreItem);

            //assert
            sitecoreItem.Versions.Received().RemoveVersion();
            sitecoreItem.DidNotReceive().RecycleVersion();
        }

        [Theory, AutoNData]
        internal void DeleteItemVersion_ShouldRecycleItemVersionIfRecycleBinActive(
            [Frozen] BaseSettings settings,
            HorizonItemHelper sut,
            FakeItem item
        )
        {
            //act
            item.WithItemVersions();
            Item sitecoreItem = item.ToSitecoreItem();
            settings.Core().RecycleBinActive.Returns(true);

            //act
            sut.DeleteItemVersion(sitecoreItem);

            //assert
            sitecoreItem.Received().RecycleVersion();
            sitecoreItem.Versions.DidNotReceive().RemoveVersion();
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnContentItemIfContentItemPathAndVersionProvided(
            ISitecoreContext context,
            HorizonItemHelper sut,
            Item item,
            Version version,
            string path)
        {
            // arrange
            item.Paths.IsContentItem.ReturnsTrue();
            context.Database.GetItem(path, context.Language, version).Returns(item);

            // act
            var resultById = sut.GetItem(item.ID, version, ItemScope.ContentOnly);
            var resultByPath = sut.GetItem(path, version, ItemScope.ContentOnly);

            // assert
            resultById.Should().Be(item);
            resultByPath.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnContentItemIfContentItemPathProvided(
            ISitecoreContext context,
            HorizonItemHelper sut,
            Item item,
            string path)
        {
            // arrange
            item.Paths.IsContentItem.ReturnsTrue();
            context.Database.GetItem(path).Returns(item);

            // act
            var resultById = sut.GetItem(item.ID, ItemScope.ContentOnly);
            var resultByPath = sut.GetItem(path, ItemScope.ContentOnly);

            // assert
            resultById.Should().Be(item);
            resultByPath.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnContentItemIfContentRootItemPathProvided(
            ISitecoreContext context,
            HorizonItemHelper sut)
        {
            // arrange
            Item item = new FakeItem(ItemIDs.ContentRoot, context.Database).ToSitecoreItem();
            item.Paths.IsContentItem.ReturnsFalse();
            context.Database.GetItem(ItemIDs.ContentRoot).Returns(item);

            // act
            var resultById = sut.GetItem(ItemIDs.ContentRoot, ItemScope.ContentOnly);
            var resultByPath = sut.GetItem(ItemIDs.ContentRoot.ToString(), ItemScope.ContentOnly);

            // assert
            resultById.Should().Be(item);
            resultByPath.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnNullIfProvidedPathIsNotAContentItemPath(
            ISitecoreContext context,
            HorizonItemHelper sut,
            Item item,
            string path)
        {
            // arrange
            item.Paths.IsContentItem.ReturnsFalse();
            context.Database.GetItem(path).Returns(item);

            // act
            var resultById = sut.GetItem(item.ID, ItemScope.ContentOnly);
            var resultByPath = sut.GetItem(path, ItemScope.ContentOnly);

            // assert
            resultById.Should().BeNull();
            resultByPath.Should().BeNull();
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnMediaItemIfMediaItemPathProvided(
            ISitecoreContext context,
            HorizonItemHelper sut,
            Item item,
            string path)
        {
            // arrange
            item.Paths.FullPath.Returns("/sitecore/media library/folder/item");
            context.Database.GetItem(path).Returns(item);

            // act
            var resultById = sut.GetItem(item.ID, ItemScope.MediaOnly);
            var resultByPath = sut.GetItem(path, ItemScope.MediaOnly);

            // assert
            resultById.Should().Be(item);
            resultByPath.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnMediaItemIfMediaLibraryRootItemPathProvided(
            ISitecoreContext context,
            HorizonItemHelper sut)
        {
            // arrange
            Item item = new FakeItem(ItemIDs.MediaLibraryRoot, context.Database).ToSitecoreItem();
            item.Paths.FullPath.Returns("/sitecore/media library");

            // act
            var resultById = sut.GetItem(ItemIDs.MediaLibraryRoot, ItemScope.MediaOnly);
            var resultByPath = sut.GetItem(ItemIDs.MediaLibraryRoot.ToString(), ItemScope.MediaOnly);

            // assert
            resultById.Should().Be(item);
            resultByPath.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnNullIfProvidedPathIsNotAMediaItemPath(
            ISitecoreContext context,
            HorizonItemHelper sut,
            Item item,
            string path)
        {
            // arrange
            context.Database.GetItem(path).Returns(item);
            item.Paths.FullPath.Returns("/sitecore/content/Home");

            // act
            var resultById = sut.GetItem(item.ID, ItemScope.MediaOnly);
            var resultByPath = sut.GetItem(path, ItemScope.MediaOnly);

            // assert
            resultById.Should().BeNull();
            resultByPath.Should().BeNull();
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnRenderingItemIfRenderingItemPathProvided(
            ISitecoreContext context,
            HorizonItemHelper sut,
            Item item,
            string path)
        {
            // arrange
            item.Paths.FullPath.Returns("/sitecore/layout/Renderings/SampleMvcRendering2");
            context.Database.GetItem(path).Returns(item);

            // act
            var resultById = sut.GetItem(item.ID, ItemScope.LayoutOnly);
            var resultByPath = sut.GetItem(path, ItemScope.LayoutOnly);

            // assert
            resultById.Should().Be(item);
            resultByPath.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnLayoutItemIfLayoutRootItemPathProvided(
            ISitecoreContext context,
            HorizonItemHelper sut)
        {
            // arrange
            Item item = new FakeItem(ItemIDs.LayoutRoot, context.Database).ToSitecoreItem();
            item.Paths.FullPath.Returns("/sitecore/layout");

            // act
            var resultById = sut.GetItem(ItemIDs.LayoutRoot, ItemScope.LayoutOnly);
            var resultByPath = sut.GetItem(ItemIDs.LayoutRoot.ToString(), ItemScope.LayoutOnly);

            // assert
            resultById.Should().Be(item);
            resultByPath.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void GetItem_ShouldReturnNullIfProvidedPathIsNotALayoutItemPath(
            ISitecoreContext context,
            HorizonItemHelper sut,
            Item item,
            string path)
        {
            // arrange
            context.Database.GetItem(path).Returns(item);
            item.Paths.FullPath.Returns("/sitecore/content/Home");

            // act
            var resultById = sut.GetItem(item.ID, ItemScope.LayoutOnly);
            var resultByPath = sut.GetItem(path, ItemScope.LayoutOnly);

            // assert
            resultById.Should().BeNull();
            resultByPath.Should().BeNull();
        }

        [Theory]
        [InlineAutoNData(ItemScope.ContentOnly)]
        [InlineAutoNData(ItemScope.MediaOnly)]
        [InlineAutoNData(ItemScope.LayoutOnly)]
        [InlineAutoNData(ItemScope.AnyNonSystem)]
        internal void GetItem_ShouldReturnNullIfNonExistingItemPathProvided(
            ItemScope scope,
            ISitecoreContext context,
            HorizonItemHelper sut,
            string path,
            ID id)
        {
            // arrange
            context.Database.GetItem(path).ReturnsNull();

            // act
            var resultById = sut.GetItem(id, scope);
            var resultByPath = sut.GetItem(path, scope);

            // assert
            resultById.Should().BeNull();
            resultByPath.Should().BeNull();
        }

        [Theory]
        [InlineAutoNData(ItemScope.ContentOnly)]
        internal void GetItem_ShouldReturnInItemThatDoNotBelongsToContentWhenScopeIsExtended(
            ItemScope scope,
            ISitecoreContext context,
            BaseTemplateManager templateManager,
            BaseItemManager baseItemManager,
            BaseLinkManager linkManager,
            BaseSettings settings,
            Item item,
            ID id)
        {
            // arrange
            var sut = new HorizonItemHelper(templateManager, settings, context, linkManager, baseItemManager);
            var customPath = "/sitecore/custom content";
            context.Database.GetItem(id).Returns(item);
            settings.GetSetting("Horizon.ExtraContentScopePaths").Returns(customPath);
            item.Paths.FullPath.Returns(customPath);

            // act
            var result = sut.GetItem(id, scope);

            // assert
            result.Should().NotBeNull();
            result.Should().Be(item);
        }

        [Theory, AutoNData]
        internal void GetBranchTemplateId_ShouldReturnTemplateIdOfFirstChildIdAsBranchTemplateId(
            [NoAutoProperties] HorizonItemHelper sut,
            TemplateItem templateItem,
            FakeItem branchItem,
            ID templateId)
        {
            // arrange
            branchItem.WithTemplate(templateId);
            templateItem.InnerItem.TemplateID.Returns(TemplateIDs.BranchTemplate);
            templateItem.InnerItem.AsFake().WithChild(branchItem);

            // act
            var result = sut.GetBranchTemplateId(templateItem);

            // assert
            result.Should().Be(templateId);
        }

        [Theory, AutoNData]
        internal void GetBranchTemplateId_ShouldReturnNullIfTemplateItemIsNotBranchItem(
            [NoAutoProperties] HorizonItemHelper sut,
            TemplateItem templateItem,
            ID templateId)
        {
            // arrange
            templateItem.InnerItem.TemplateID.Returns(templateId);
            templateItem.InnerItem.AsFake();

            // act
            var result = sut.GetBranchTemplateId(templateItem);

            // assert
            result.Should().BeNull();
        }

        [Theory, AutoNData]
        internal void GetBranchTemplateId_ShouldReturnNullIfTemplateItemHasNoChild(
            [NoAutoProperties] HorizonItemHelper sut,
            TemplateItem templateItem)
        {
            // arrange
            templateItem.InnerItem.TemplateID.Returns(TemplateIDs.BranchTemplate);
            templateItem.InnerItem.AsFake();

            // act
            var result = sut.GetBranchTemplateId(templateItem);

            // assert
            result.Should().BeNull();
        }

        [Theory, AutoNData]
        internal void GetBranchTemplateId_ShouldThrowOnNullItem(HorizonItemHelper sut)
        {
            //act & assert
            sut.Invoking(s => s.GetBranchTemplateId(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void GenerateLink_ShouldReturnUrlWithoutLanguage([Frozen] BaseLinkManager linkManager, Item item, string link, HorizonItemHelper sut)
        {
            // arrange
            ItemUrlBuilderOptions capturedOptions = null;
            linkManager.GetItemUrl(item, Arg.Do<ItemUrlBuilderOptions>(x => capturedOptions = x)).Returns(link);

            // act
            var result = sut.GenerateLinkWithoutLanguage(item);

            // assert
            result.Should().Be(link);
            capturedOptions.LanguageEmbedding.Should().Be(LanguageEmbedding.Never);
        }

        [Theory, AutoNData]
        internal void AddItemVersion_ShouldAddNamedVersionAndReturnIt(
            [Frozen] BaseItemManager baseItemManagers,
            HorizonItemHelper sut,
            Item item,
            FakeItem itemVersionFakeItem,
            string versionName
        )
        {
            // arrange
            itemVersionFakeItem.WithItemEditing();
            itemVersionFakeItem.WithField(FieldIDs.VersionName, "");
            var itemVersion = itemVersionFakeItem.ToSitecoreItem();
            baseItemManagers.Configure().AddVersion(item).Returns(itemVersion);

            // act
            var result = sut.AddItemVersion(item, versionName);

            // assert
            itemVersion.Fields[FieldIDs.VersionName].Received().SetValue(versionName, true);
            result.Should().Be(itemVersion);
        }

        [Theory, AutoNData]
        internal void SetItemVersionName_ShouldSetVersionNameAndReturnItemVersion(
            HorizonItemHelper sut,
            FakeItem itemVersionFakeItem,
            string versionName
        )
        {
            // arrange
            itemVersionFakeItem.WithItemEditing();
            itemVersionFakeItem.WithField(FieldIDs.VersionName, "");
            var itemVersion = itemVersionFakeItem.ToSitecoreItem();

            // act
            var result = sut.SetItemVersionName(itemVersion, versionName);

            // assert
            itemVersion.Fields[FieldIDs.VersionName].Received().SetValue(versionName, true);
            result.Should().Be(itemVersion);
        }

        [Theory, AutoNData]
        internal void SetItemVersionName_ShouldNotSetVersionNameWhenFieldIsAbsent(
            HorizonItemHelper sut,
            FakeItem itemVersionFakeItem,
            string versionName
        )
        {
            // arrange
            itemVersionFakeItem.WithItemEditing();
            var itemVersion = itemVersionFakeItem.ToSitecoreItem();

            // act
            var result = sut.SetItemVersionName(itemVersion, versionName);

            // assert
            itemVersion.Fields[FieldIDs.VersionName].Should().BeNull();
            result.Should().Be(itemVersion);
        }
    }
}
