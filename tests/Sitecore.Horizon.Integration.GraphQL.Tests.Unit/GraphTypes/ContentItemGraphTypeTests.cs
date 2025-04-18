// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using Microsoft.Practices.EnterpriseLibrary.Common.Utility;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Data;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ContentItemGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldImplementInterface(ContentItemGraphTypeFixture sut, ContentInterfaceGraphType contentInterfaceGraphType)
        {
            // act & assert
            sut.Interfaces.Should().Contain(typeof(ContentInterfaceGraphType));
            contentInterfaceGraphType.Fields.ForEach(f => sut.Should().HaveField(f.Name, f.Type));
        }

        [Theory, AutoNData]
        internal void ContentItemGraphType_ShouldResolveSimpleProperties(ContentItemGraphTypeFixture sut, Item itemContext, DateTime dateTimeExpected)
        {
            //arrange
            itemContext.AsFake().WithStatistics().WithItemLocking().WithPublishing().WithSecurity().WithItemVersions();
            itemContext.Statistics.Created.Returns(dateTimeExpected);
            itemContext.Security.GetOwner().Returns("name");

            // act & assert
            sut.Should().ResolveFieldValueTo("id", itemContext.ID, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("name", itemContext.Name, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("displayName", itemContext.DisplayName, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("revision", itemContext.Statistics.Revision, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("creationDate", itemContext.Statistics.Created, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("createdBy", itemContext.Security.GetOwner(), c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("updatedBy", itemContext.Statistics.UpdatedBy, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("updatedDate", itemContext.Statistics.Updated, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("hasChildren", itemContext.HasChildren, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("template", itemContext.Template, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("version", itemContext.Version.Number, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("versions", itemContext.Versions.GetVersions(), c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("icon", itemContext[FieldIDs.Icon], c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("path", itemContext.Paths.FullPath, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("language", itemContext.Language.Name, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("parent", itemContext.Parent, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("publishing", itemContext.Publishing, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("permissions", itemContext, c => c.WithSource(itemContext));
            sut.Should().ResolveFieldValueTo("locking", itemContext, c => c.WithSource(itemContext));
        }

        [Theory, AutoNData]
        internal void ShouldReturnItemWorkflowInfo([Frozen] IHorizonWorkflowManager workflowManager, ContentItemGraphTypeFixture sut, Item itemContext, ItemWorkflowInfo itemWorkflowInfo)
        {
            //arrange
            workflowManager.Configure().GetItemWorkflowInfo(itemContext).Returns(itemWorkflowInfo);

            // act & assert
            sut.Should().ResolveFieldValueTo("workflow", itemWorkflowInfo, c => c.WithSource(itemContext));
        }

        [Theory, AutoNData]
        internal void ShouldApplyClientLanguageWForItemWorkflowInfo([Frozen] IHorizonWorkflowManager workflowManager, [Frozen] IClientLanguageService clientLanguageService, ContentItemGraphTypeFixture sut, Item itemContext, ItemWorkflowInfo itemWorkflowInfo)
        {
            //arrange
            workflowManager.Configure().GetItemWorkflowInfo(itemContext).Returns(itemWorkflowInfo);

            // act & assert
            sut.Should().ResolveFieldValueTo("workflow", itemWorkflowInfo, c => c.WithSource(itemContext));
            clientLanguageService.Received().ApplyClientLanguage();
        }

        [Theory, AutoNData]
        internal void Children_ShouldReturnHorizonItemOnly([Frozen] IHorizonItemHelper horizonItemHelper,
            ContentItemGraphTypeFixture sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsHorizonItem(Any.Item).ReturnsFalse();
            horizonItemHelper.IsHorizonItem(children[1]).ReturnsTrue();
            horizonItemHelper.IsHorizonItem(children[4]).ReturnsTrue();

            var queryContext = new HorizonQueryContext
            {
                HorizonOnlyItems = true
            };

            // act & assert
            var result = sut.ResolveFieldValue<IEnumerable<Item>>(
                "children",
                c => c
                    .WithSource(parent)
                    .WithQueryContext(queryContext));

            result.Should().Equal(children[1], children[4]);
        }

        [Theory, AutoNData]
        internal void HasChildren_ShouldReturnAllChildren([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsHorizonItem(Any.Item).ReturnsFalse();

            var queryContext = new HorizonQueryContext
            {
                HorizonOnlyItems = false
            };

            // act & assert
            var result = sut.ResolveFieldValue<IEnumerable<Item>>(
                "children",
                c => c
                    .WithSource(parent)
                    .WithQueryContext(queryContext));

            result.Should().Equal(children.Select(x => x.ToSitecoreItem()));
        }

        [Theory, AutoNData]
        internal void HasChildren_ShouldReturnTrueIfOnlyNonHorizonItemsAndCheckingHorizonOnly([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsHorizonItem(Any.Item).ReturnsFalse();
            horizonItemHelper.IsHorizonItem(children[1]).ReturnsTrue();
            horizonItemHelper.IsHorizonItem(children[4]).ReturnsTrue();

            var queryContext = new HorizonQueryContext
            {
                HorizonOnlyItems = true
            };

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "hasChildren",
                c => c
                    .WithSource(parent)
                    .WithQueryContext(queryContext));

            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void HasChildren_ShouldReturnTrueIfThereAreNoChildrenAndCheckingAnyItems([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsHorizonItem(Any.Item).ReturnsFalse();
            horizonItemHelper.IsHorizonItem(children[1]).ReturnsTrue();
            horizonItemHelper.IsHorizonItem(children[4]).ReturnsTrue();

            var queryContext = new HorizonQueryContext
            {
                HorizonOnlyItems = false
            };

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "hasChildren",
                c => c
                    .WithSource(parent)
                    .WithQueryContext(queryContext));

            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void HasChildren_ShouldReturnFalseIfOnlyNonHorizonItemsAndCheckingHorizonOnly([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsHorizonItem(Any.Item).ReturnsFalse();

            var queryContext = new HorizonQueryContext
            {
                HorizonOnlyItems = true
            };

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "hasChildren",
                c => c
                    .WithSource(parent)
                    .WithQueryContext(queryContext));

            result.Should().BeFalse();
        }

        [Theory, AutoNData]
        internal void HasChildren_ShouldReturnFalseIfThereAreNoChildrenAndCheckingAnyItems([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item parent)
        {
            //arrange
            horizonItemHelper.IsHorizonItem(parent).ReturnsFalse();

            var queryContext = new HorizonQueryContext
            {
                HorizonOnlyItems = false
            };

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "hasChildren",
                c => c
                    .WithSource(parent)
                    .WithQueryContext(queryContext));

            result.Should().BeFalse();
        }

        [Theory, AutoNData]
        internal void Ancestors_ShouldReturnAncestorsTreeWithRootPath([Frozen] IHorizonItemHelper horizonItemHelper,
            [Frozen] IHorizonItemTreeBuilder horizonItemTreeBuilder, [Frozen] ISitecoreContext scContext, ContentItemGraphTypeFixture sut,
            Item parent, Generator<FakeItem> itemGenerator, Database db, Item[] items)
        {
            //arrange
            var contentRootItem = new FakeItem(ItemIDs.ContentRoot, db).ToSitecoreItem();
            horizonItemHelper.Configure().GetItem(scContext.Site.RootPath).Returns(contentRootItem);

            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemTreeBuilder.Configure().BuildAncestorsTreeFlat(parent, contentRootItem).Returns(items);

            // act
            var result = sut.ResolveFieldValue<IEnumerable<Item>>(
                "ancestors",
                c => c
                    .WithSource(parent)
                    .WithArg("rootItem", contentRootItem));

            // assert
            result.Should().HaveCount(items.Length);
            result.Should().Equal(items);
        }

        [Theory, AutoNData]
        internal void Ancestors_ShouldReturnGqlErrorIfNoRootFound([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item parent, Generator<FakeItem> itemGenerator, string path)
        {
            //arrange
            horizonItemHelper.Configure().GetItem("").ReturnsNull();

            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            sut.Invoking(s => s.ResolveFieldValue(
                    "ancestors",
                    c => c
                        .WithSource(parent)))
                .Should().Throw<HorizonGqlError>().WithErrorCode(ItemErrorCode.RootNotFound);
        }

        [Theory, AutoNData]
        internal void InsertOptions_ShouldReturnKindPage([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item item, Generator<FakeItem> itemGenerator, InsertOptionKind kind)
        {
            //arrange
            var insertOptions = itemGenerator.Take(5).Select(i => new TemplateItem(i.ToSitecoreItem())).ToArray();

            horizonItemHelper.Configure().GetInsertOptions(item).Returns(insertOptions);

            horizonItemHelper.Configure().IsBranchTemplateWithPresentation(Arg.Any<TemplateItem>()).ReturnsFalse();
            horizonItemHelper.Configure().IsTemplateWithPresentation(Arg.Any<TemplateItem>()).ReturnsFalse();

            horizonItemHelper.Configure().IsTemplateWithPresentation(insertOptions[0]).ReturnsTrue();
            horizonItemHelper.Configure().IsBranchTemplateWithPresentation(insertOptions[0]).ReturnsTrue();

            horizonItemHelper.Configure().IsTemplateWithPresentation(insertOptions[4]).ReturnsTrue();
            horizonItemHelper.Configure().IsBranchTemplateWithPresentation(insertOptions[4]).ReturnsTrue();

            var result = sut.ResolveFieldValue<IEnumerable<TemplateItem>>(
                "insertOptions",
                c => c
                    .WithSource(item)
                    .WithArg("kind", InsertOptionKind.Page));

            // assert
            result.Should().Equal(insertOptions[0], insertOptions[4]);
        }

        [Theory, AutoNData]
        internal void InsertOptions_ShouldReturnInsertKindFolder([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item item, Generator<FakeItem> itemGenerator, InsertOptionKind kind)
        {
            //arrange
            var insertOptions = itemGenerator.Take(5).Select(i => new TemplateItem(i.ToSitecoreItem())).ToArray();

            horizonItemHelper.Configure().GetInsertOptions(item).Returns(insertOptions);

            horizonItemHelper.Configure().IsBranchTemplateWithPresentation(Arg.Any<TemplateItem>()).ReturnsFalse();
            horizonItemHelper.Configure().IsTemplateWithPresentation(Arg.Any<TemplateItem>()).ReturnsFalse();
            horizonItemHelper.Configure().IsFolderTemplate(Arg.Any<TemplateItem>()).ReturnsFalse();

            horizonItemHelper.Configure().IsFolderTemplate(insertOptions[1]).ReturnsTrue();


            var result = sut.ResolveFieldValue<IEnumerable<TemplateItem>>(
                "insertOptions",
                c => c
                    .WithSource(item)
                    .WithArg("kind", InsertOptionKind.Folder));

            // assert
            result.Should().Equal(insertOptions[1]);
        }

        [Theory, AutoNData]
        internal void InsertOptions_ShouldReturnAllItemsForItemKind([Frozen] IHorizonItemHelper horizonItemHelper, ContentItemGraphTypeFixture sut, Item item, Generator<FakeItem> itemGenerator, InsertOptionKind kind)
        {
            //arrange
            var insertOptions = itemGenerator.Take(5).Select(i => new TemplateItem(i.ToSitecoreItem())).ToArray();

            horizonItemHelper.Configure().GetInsertOptions(item).Returns(insertOptions);

            horizonItemHelper.Configure().IsBranchTemplateWithPresentation(Arg.Any<TemplateItem>()).ReturnsFalse();
            horizonItemHelper.Configure().IsTemplateWithPresentation(Arg.Any<TemplateItem>()).ReturnsFalse();
            horizonItemHelper.Configure().IsFolderTemplate(Arg.Any<TemplateItem>()).ReturnsFalse();


            var result = sut.ResolveFieldValue<IEnumerable<TemplateItem>>(
                "insertOptions",
                c => c
                    .WithSource(item)
                    .WithArg("kind", InsertOptionKind.Item));

            // assert
            result.Should().Equal(insertOptions);
        }

        [Theory, AutoNData]
        internal void InsertOptions_ShouldSetClientLanguage([Frozen] IHorizonItemHelper horizonItemHelper, [Frozen] IClientLanguageService clientLanguageService, ContentItemGraphTypeFixture sut, Item item, Generator<FakeItem> itemGenerator, InsertOptionKind kind)
        {
            //arrange
            var insertOptions = itemGenerator.Take(5).Select(i => new TemplateItem(i.ToSitecoreItem())).ToArray();

            horizonItemHelper.Configure().GetInsertOptions(item).Returns(insertOptions);


            var result = sut.ResolveFieldValue<IEnumerable<TemplateItem>>(
                "insertOptions",
                c => c
                    .WithSource(item)
                    .WithArg("kind", InsertOptionKind.Item));

            // assert
            clientLanguageService.Received().ApplyClientLanguage();
        }

        [Theory, AutoNData]
        internal void IsLatestPublishableVersion_ShouldReturnTrueIfCurrentVersionIsLatestPublishable([Frozen] ISitecoreContext context, ContentItemGraphTypeFixture sut, Item itemVersion, Item latestVersion)
        {
            // arrange
            context.Site.EnableWorkflow.Returns(true);
            itemVersion.AsFake().WithPublishing();
            itemVersion.Version.Returns(latestVersion.Version);
            var latestPublishableVersion = itemVersion.Publishing.GetValidVersion(Arg.Any<DateTime>(), true).Returns(latestVersion);

            var queryContext = new HorizonQueryContext
            {
                HorizonOnlyItems = false
            };

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "isLatestPublishableVersion",
                c => c
                    .WithSource(itemVersion)
                    .WithQueryContext(queryContext));

            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void IsLatestPublishableVersion_ShouldReturnFalseIfCurrentVersionIsNotLatestPublishable([Frozen] ISitecoreContext context, ContentItemGraphTypeFixture sut, Item itemVersion, Item latestVersion)
        {
            // arrange
            context.Site.EnableWorkflow.Returns(true);
            itemVersion.AsFake().WithPublishing().WithVersion(3);

            var latestPublishableVersion = itemVersion.Publishing.GetValidVersion(Arg.Any<DateTime>(), true).Returns(latestVersion);

            var queryContext = new HorizonQueryContext
            {
                HorizonOnlyItems = false
            };

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "isLatestPublishableVersion",
                c => c
                    .WithSource(itemVersion)
                    .WithQueryContext(queryContext));

            result.Should().BeFalse();
        }

        internal class ContentItemGraphTypeFixture : ContentItemGraphType
        {
            public ContentItemGraphTypeFixture(IHorizonItemHelper itemHelper, ISitecoreContext scContext, IHorizonWorkflowManager workflowManager, IClientLanguageService clientLanguageService, IHorizonItemTreeBuilder itemTreeBuilder)
                : base(implementContentInterface: true, itemHelper, scContext, workflowManager, clientLanguageService, itemTreeBuilder)
            {
            }
        }
    }
}
