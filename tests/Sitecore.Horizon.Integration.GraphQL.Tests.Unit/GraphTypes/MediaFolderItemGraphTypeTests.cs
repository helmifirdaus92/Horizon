// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class MediaFolderItemGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(MediaFolderItemGraphType sut, Item item)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("id", item.ID, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("parentId", item.ParentID, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("displayName", item.DisplayName, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("permissions", item, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void Children_ShouldReturnMediaFolderOnly([Frozen] IHorizonItemHelper horizonItemHelper, MediaFolderItemGraphType sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsFolder(Any.Item).ReturnsFalse();
            horizonItemHelper.IsMediaFolder(Any.Item).ReturnsTrue();

            // act & assert
            var result = sut.ResolveFieldValue<IEnumerable<Item>>(
                "children",
                c => c
                    .WithSource(parent));

            result.Should().Equal(children.Select(x => x.ToSitecoreItem()));
        }

        [Theory, AutoNData]
        internal void Children_ShouldReturnFolderOnly([Frozen] IHorizonItemHelper horizonItemHelper, MediaFolderItemGraphType sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsMediaFolder(Any.Item).ReturnsFalse();
            horizonItemHelper.IsFolder(Any.Item).ReturnsFalse();
            horizonItemHelper.IsFolder(children[0]).ReturnsTrue();
            horizonItemHelper.IsFolder(children[1]).ReturnsTrue();


            // act & assert
            var result = sut.ResolveFieldValue<IEnumerable<Item>>(
                "children",
                c => c
                    .WithSource(parent));

            result.Should().Equal(children[0], children[1]);
        }

        [Theory, AutoNData]
        internal void HasChildren_ShouldReturnTrueIfChildrenFolderExists([Frozen] IHorizonItemHelper horizonItemHelper, MediaFolderItemGraphType sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsFolder(Any.Item).ReturnsFalse();
            horizonItemHelper.IsFolder(children[1]).ReturnsTrue();
            horizonItemHelper.IsFolder(children[4]).ReturnsTrue();

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "hasChildren",
                c => c
                    .WithSource(parent));

            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void HasChildren_ShouldReturnTrueIfChildrenMediaFolderExists([Frozen] IHorizonItemHelper horizonItemHelper, MediaFolderItemGraphType sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsMediaFolder(Any.Item).ReturnsFalse();
            horizonItemHelper.IsMediaFolder(children[1]).ReturnsTrue();
            horizonItemHelper.IsMediaFolder(children[4]).ReturnsTrue();

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "hasChildren",
                c => c
                    .WithSource(parent));

            result.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void HasChildren_ShouldReturnFalseIfNoMediaFolderOrFolderChildrenExists([Frozen] IHorizonItemHelper horizonItemHelper, MediaFolderItemGraphType sut, Item parent, Generator<FakeItem> itemGenerator)
        {
            //arrange
            var children = itemGenerator.Take(5).ToArray();
            parent.AsFake().WithChildren(children);

            horizonItemHelper.IsMediaFolder(Any.Item).ReturnsFalse();
            horizonItemHelper.IsFolder(Any.Item).ReturnsFalse();

            // act & assert
            var result = sut.ResolveFieldValue<bool>(
                "hasChildren",
                c => c
                    .WithSource(parent));

            result.Should().BeFalse();
        }
    }
}
