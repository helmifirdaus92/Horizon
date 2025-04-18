// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class RawItemGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveParentIdField(RawItemGraphType sut, Item item)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("parentId", item.ParentID, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldResolveUrlField([Frozen] IHorizonItemHelper itemHelper, RawItemGraphType sut, Item item, string url)
        {
            //arrange
            itemHelper.GenerateLinkWithoutLanguage(item).Returns(url);

            // act & assert
            sut.Should().ResolveFieldValueTo("url", url, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldResolveIsFolderField([Frozen] IHorizonItemHelper itemHelper, RawItemGraphType sut, Item item)
        {
            //arrange
            itemHelper.IsFolder(item).ReturnsFalse();

            // act & assert
            sut.Should().ResolveFieldValueTo("isFolder", false, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void GetAncestorsWithSiblings_ShouldResolveField_WhenRootsIsEmpty([Frozen] IHorizonItemTreeBuilder itemTreeBuilder, RawItemGraphType sut, Item item, Item[] ancestors)
        {
            //arrange
            itemTreeBuilder.AncestorsWithSiblingsTreeFlat(item, Any.Arg<Item[]>()).Returns(ancestors);

            // act & assert
            sut.Should().ResolveFieldValueTo("ancestorsWithSiblings", ancestors, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void GetAncestorsWithSiblings_ShouldResolveField_WhenRootsHasValue([Frozen] IHorizonItemTreeBuilder itemTreeBuilder,
            [Frozen] IHorizonItemHelper itemHelper, RawItemGraphType sut, Item item, Item[] roots, Item[] ancestors)
        {
            //arrange
            foreach (Item root in roots)
            {
                itemHelper.Configure().GetItem(root.Paths.FullPath).Returns(root);
            }

            itemTreeBuilder.AncestorsWithSiblingsTreeFlat(item, Arg.Any<Item[]>()).Returns(ancestors);


            // act & assert
            sut.Should().ResolveFieldValueTo("ancestorsWithSiblings", ancestors, c =>
            {
                c.WithSource(item).WithArgs(("roots", roots.Select(r => r.Paths.FullPath)));
            });
            itemTreeBuilder.Received().AncestorsWithSiblingsTreeFlat(item, Arg.Is<Item[]>(actualRoots => actualRoots.All(ar => roots.Any(r => r.ID == ar.ID))));
        }

        [Theory, AutoNData]
        internal void GetAncestorsWithSiblings_ShouldThrowException_WhenRootsIsEmpty_AndContentRootIsNotReachable([Frozen] IHorizonItemHelper itemHelper, RawItemGraphType sut, Item item)
        {
            //arrange
            itemHelper.GetItem(Arg.Any<ID>()).ReturnsNull();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue<Item[]>("ancestorsWithSiblings",
                c => c.WithSource(item))).Should().Throw<HorizonGqlError>().WithErrorCode(GenericErrorCodes.UnknownError);
        }

        [Theory, AutoNData]
        internal void GetAncestorsWithSiblings_ShouldThrowException_WhenRootsHasValue_AndSomeOfRootsIsNotFound([Frozen] IHorizonItemHelper itemHelper,
            RawItemGraphType sut, Item item, string[] roots)
        {
            //arrange
            itemHelper.Configure().GetItem(roots[0]).ReturnsNull();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue<Item[]>("ancestorsWithSiblings",
                c => c.WithSource(item).WithArgs(("roots", roots)))).Should().Throw<HorizonGqlError>().WithErrorCode(ItemErrorCode.RootNotFound);
        }

        [Theory, AutoNData]
        internal void ShouldThrowException_WhenAncestorsWithSiblingsIsNull([Frozen] IHorizonItemTreeBuilder itemTreeBuilder,
            RawItemGraphType sut, Item item)
        {
            //arrange
            itemTreeBuilder.AncestorsWithSiblingsTreeFlat(item, Arg.Any<Item[]>()).ReturnsNull();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue<Item[]>("ancestorsWithSiblings",
                c => c.WithSource(item))).Should().Throw<HorizonGqlError>().WithErrorCode(ItemErrorCode.RootNotReachable);
        }
    }
}
