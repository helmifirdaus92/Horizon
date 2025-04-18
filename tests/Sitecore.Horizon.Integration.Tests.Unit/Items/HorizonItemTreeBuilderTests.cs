// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Tests.Unit.Helper;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Items
{
    public class HorizonItemTreeBuilderTests
    {
        [Theory]
        [AutoNData]
        internal void Map_ShouldReturnCorrectFlatTree(
            [Frozen] IHorizonItemHelper itemHelper,
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            itemHelper.Configure().IsHorizonItem(Arg.Any<Item>()).Returns(true);

            var content = itemGenerator.First();
            var root = itemGenerator.First();
            var level1 = itemGenerator.Take(3).ToArray();
            var level2 = itemGenerator.Take(3).ToArray();
            var level3 = itemGenerator.Take(3).ToArray();

            root.WithParent(content);
            root.WithName("root").WithChildren(level1);
            level1[0].WithName("level1.0").WithChildren(level2);
            level2[0].WithName("level2.0").WithChildren(level3);
            level3[0].WithName("level3.0");


            // act
            var result = sut.BuildAncestorsTreeFlat(level3[0], root);

            //assert
            result.Select(r => r.ID).Should().NotContain(content.ID);
            result[0].ID.Should().Be(root.ID);
            result[1].ID.Should().Be(level1[0].ID);
            result[2].ID.Should().Be(level2[0].ID);
        }

        [Theory]
        [AutoNData]
        internal void Map_ShouldReturnFlatTreeForPageBranch(
            [Frozen] IHorizonItemHelper itemHelper,
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            itemHelper.Configure().IsHorizonItem(Arg.Any<Item>()).Returns(true);

            var content = itemGenerator.First();
            var presentationFolder = itemGenerator.First();
            presentationFolder.WithParent(content);

            var branchFolder = itemGenerator.First();
            branchFolder.WithTemplate(new ID("{35E75C72-4985-4E09-88C3-0EAC6CD1E64F}"));
            branchFolder.WithParent(presentationFolder);
            branchFolder.WithName("branchFolder001");

            var level1 = itemGenerator.Take(3).ToArray();
            level1[0].WithName("level1.0");
            branchFolder.WithChildren(level1);

            var level2 = itemGenerator.Take(3).ToArray();
            level2[0].WithName("level2.0");
            level1[0].WithChildren(level2);

            // act
            var result = sut.BuildAncestorsTreeFlat(level2[0], content);

            //assert
            result.Length.Should().Be(2);
            result[0].ID.Should().Be(branchFolder.ID);
            result[1].ID.Should().Be(level1[0].ID);
        }

        [Theory]
        [AutoNData]
        internal void Map_ShouldReturnEmptyArrayIfAnyOfAncestorsIsNotHorizonItem(
            [Frozen] IHorizonItemHelper itemHelper,
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            itemHelper.Configure().IsHorizonItem(Arg.Any<Item>()).Returns(false);

            var content = itemGenerator.First();
            var root = itemGenerator.First();
            var level1 = itemGenerator.Take(3).ToArray();
            var level2 = itemGenerator.Take(3).ToArray();

            root.WithParent(content);
            root.WithName("root").WithChildren(level1);
            level1[0].WithName("level1.0").WithChildren(level2);


            // act
            var result = sut.BuildAncestorsTreeFlat(level2[0], root);

            //assert
            result.Length.Should().Be(0);
        }

        [Theory]
        [AutoNData]
        internal void Map_ShouldReturnRootWhenAskedForRoot(
            HorizonItemTreeBuilder sut,
            FakeItem root
        )
        {
            // act
            var result = sut.BuildAncestorsTreeFlat(root, root);

            //assert
            result.Length.Should().Be(1);
            result[0].ID.Should().Be(root.ID);
        }

        [Theory, AutoNData]
        internal void BuildAncestorsWithSiblingsTreeFlat_ShouldReturnCorrectFlatTree(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1")
                    {
                        new("1 > 1"),
                        new("1 > 2"),
                        new("1 > 3"),
                    },
                    new("2")
                    {
                        new("2 > 1"),
                        new("2 > 2")
                        {
                            new("2 > 2 > 1"),
                            new("2 > 2 > 2"),
                            new("2 > 2 > 3"),
                        },
                        new("2 > 3"),
                        new("2 > 4"),
                    },
                    new("3")
                    {
                        new("3 > 1"),
                        new("3 > 2"),
                        new("3 > 3")
                        {
                            new("3 > 3 > 1"),
                            new("3 > 3 > 2"),
                            new("3 > 3 > 3"),
                        },
                        new("3 > 4"),
                    }
                });

            var item = root.ToSitecoreItem().FindByName("2 > 2 > 2");

            // act
            var result = sut.AncestorsWithSiblingsTreeFlat(item, ToArray(root.ToSitecoreItem()));

            // assert
            result.Select(m => m.DisplayName).Should().Equal(
                "Root",
                "1",
                "2",
                "2 > 1",
                "2 > 2",
                "2 > 2 > 1",
                "2 > 2 > 2",
                "2 > 2 > 3",
                "2 > 3",
                "2 > 4",
                "3");
        }

        [Theory, AutoNData]
        internal void BuildAncestorsWithSiblingsTreeFlat_ShouldReturnMultipleRoots(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1"),
                    new("2"),
                    new("3")
                });

            //
            // act
            var result = sut.AncestorsWithSiblingsTreeFlat(root, ToArray(root.ToSitecoreItem())).ToArray();

            // assert
            result[0].ID.Should().Be(root.ID);
            result.Length.Equals(1);
        }

        [Theory, AutoNData]
        internal void AncestorsWithSiblingsTreeFlat_ShouldIncludeMultipleRootsButExpandOnlyOne(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("Root1")
                    {
                        new("r1 > 1"),
                    },
                    new("Root2")
                    {
                        new("r2 > 1")
                        {
                            new("r2 > 1 > 1")
                        },
                        new("r2 > 2"),
                    },
                    new("Root3")
                    {
                        new("r1 > 1"),
                        new("r1 > 2"),
                    },
                });

            var root1 = root.ToSitecoreItem().FindByName("Root1");
            var root2 = root.ToSitecoreItem().FindByName("Root2");
            var root3 = root.ToSitecoreItem().FindByName("Root3");

            var item = root.ToSitecoreItem().FindByName("r2 > 1 > 1");

            // act
            var result = sut.AncestorsWithSiblingsTreeFlat(item, ToArray(root1, root2, root3)).ToArray();

            // assert
            result.Select(m => m.DisplayName).Should().Equal(
                "Root1",
                "Root2",
                "r2 > 1",
                "r2 > 1 > 1",
                "r2 > 2",
                "Root3");
        }

        [Theory, AutoNData]
        internal void AncestorsWithSiblingsTreeFlat_ShouldOnlyReturnAncestorsTillPassedRootItem(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1")
                    {
                        new("1 > 1"),
                        new("1 > 2"),
                        new("1 > 3"),
                    },
                    new("2")
                    {
                        new("2 > 1"),
                        new("2 > 2")
                        {
                            new("2 > 2 > 1"),
                            new("2 > 2 > 2"),
                            new("2 > 2 > 3"),
                        },
                        new("2 > 3"),
                        new("2 > 4"),
                    },
                    new("3")
                    {
                        new("3 > 1"),
                        new("3 > 2"),
                        new("3 > 3")
                        {
                            new("3 > 3 > 1"),
                            new("3 > 3 > 2"),
                            new("3 > 3 > 3"),
                        },
                        new("3 > 4"),
                    }
                });

            var item = root.ToSitecoreItem().FindByName("2 > 2 > 2");
            var customRoot = root.ToSitecoreItem().FindByName("2");

            var result = sut.AncestorsWithSiblingsTreeFlat(item, ToArray(customRoot));

            // assert
            result.Select(m => m.DisplayName).Should().Equal(
                "2",
                "2 > 1",
                "2 > 2",
                "2 > 2 > 1",
                "2 > 2 > 2",
                "2 > 2 > 3",
                "2 > 3",
                "2 > 4");
        }

        [Theory, AutoNData]
        internal void AncestorsWithSiblingsTreeFlat_ShouldReturnNullIfRootIsNotReachable(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator,
            Item nonReachableRoot
        )
        {
            // arrange
            var tree = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1"),
                    new("2"),
                    new("3"),
                }
            );

            // act
            var result = sut.AncestorsWithSiblingsTreeFlat(tree, new[]
            {
                nonReachableRoot
            });

            //assert
            result.Should().BeNull();
        }

        [Theory, AutoNData]
        internal void TryBuildMediaFolderAncestorsTree_ShouldReturnCorrectFlatTree(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1")
                    {
                        new("1 > 1"),
                        new("1 > 2"),
                        new("1 > 3"),
                    },
                    new("2")
                    {
                        new("2 > 1"),
                        new("2 > 2")
                        {
                            new("2 > 2 > 1"),
                            new("2 > 2 > 2"),
                            new("2 > 2 > 3"),
                        },
                        new("2 > 3"),
                        new("2 > 4"),
                    },
                    new("3")
                    {
                        new("3 > 1"),
                        new("3 > 2"),
                        new("3 > 3")
                        {
                            new("3 > 3 > 1"),
                            new("3 > 3 > 2"),
                            new("3 > 3 > 3"),
                        },
                        new("3 > 4"),
                    }
                });

            var item = root.ToSitecoreItem().FindByName("2 > 2 > 2");

            // act
            var result = sut.TryBuildMediaFolderAncestorsTree(item, ToArray(root.ToSitecoreItem()));

            // assert
            result.Select(m => m.DisplayName).Should().Equal(
                "Root",
                "1",
                "2",
                "2 > 1",
                "2 > 2",
                "2 > 2 > 1",
                "2 > 2 > 2",
                "2 > 2 > 3",
                "2 > 3",
                "2 > 4",
                "3");
        }

        [Theory, AutoNData]
        internal void TryBuildMediaFolderAncestorsTree_ShouldReturnNullIfAnyOfAncestorIsNotAFolderOrMediaFolder(
            [Frozen] IHorizonItemHelper itemHelper,
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1")
                    {
                        new("1 > 1"),
                        new("1 > 2"),
                        new("1 > 3"),
                    },
                    new("2")
                    {
                        new("2 > 1"),
                        new("2 > 2")
                        {
                            new("2 > 2 > 1"),
                            new("2 > 2 > 2"),
                            new("2 > 2 > 3"),
                        },
                        new("2 > 3"),
                        new("2 > 4"),
                    },
                    new("3")
                    {
                        new("3 > 1"),
                        new("3 > 2"),
                        new("3 > 3")
                        {
                            new("3 > 3 > 1"),
                            new("3 > 3 > 2"),
                            new("3 > 3 > 3"),
                        },
                        new("3 > 4"),
                    }
                });

            Item nonMediaFolderItem = root.ToSitecoreItem().FindByName("2 > 2");
            itemHelper.IsMediaFolder(nonMediaFolderItem).Returns(false);
            itemHelper.IsFolder(nonMediaFolderItem).Returns(false);

            var item = root.ToSitecoreItem().FindByName("2 > 2 > 2");

            // act
            var result = sut.TryBuildMediaFolderAncestorsTree(item, ToArray(root.ToSitecoreItem()));

            // assert
            result.Should().BeNull();
        }

        [Theory, AutoNData]
        internal void TryBuildMediaFolderAncestorsTree_ShouldReturnMultipleRoots(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1"),
                    new("2"),
                    new("3")
                });

            // act
            var result = sut.TryBuildMediaFolderAncestorsTree(root, ToArray(root.ToSitecoreItem())).ToArray();

            // assert
            result[0].ID.Should().Be(root.ID);
            result.Length.Equals(1);
        }

        [Theory, AutoNData]
        internal void TryBuildMediaFolderAncestorsTree_ShouldOnlyIncludeFolderAndMediaFolderItemsInTree(
            [Frozen] IHorizonItemHelper itemHelper,
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1"),
                    new("2"),
                    new("3")
                });

            var nonMediaFolderItem = root.ToSitecoreItem().FindByName("2");
            itemHelper.IsMediaFolder(nonMediaFolderItem).Returns(false);
            itemHelper.IsFolder(nonMediaFolderItem).Returns(false);

            var item = root.ToSitecoreItem().FindByName("3");

            // act
            var result = sut.TryBuildMediaFolderAncestorsTree(item, ToArray(root.ToSitecoreItem())).ToArray();

            // assert
            result.Select(m => m.DisplayName).Should().Equal(
                "Root",
                "1",
                "3");
        }

        [Theory, AutoNData]
        internal void TryBuildMediaFolderAncestorsTree_ShouldIncludeMultipleRootsButExpandOnlyOne(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            // arrange
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("Root1")
                    {
                        new("r1 > 1"),
                        new("r1 > 2"),
                    },
                    new("Root2")
                    {
                        new("r2 > 1")
                        {
                            new("r2 > 1 > 1")
                        },
                        new("r2 > 2"),
                    },
                    new("Root3")
                    {
                        new("r1 > 1"),
                        new("r1 > 2"),
                    },
                });

            var root1 = root.ToSitecoreItem().FindByName("Root1");
            var root2 = root.ToSitecoreItem().FindByName("Root2");
            var root3 = root.ToSitecoreItem().FindByName("Root3");

            var item = root.ToSitecoreItem().FindByName("r2 > 1 > 1");

            // act
            var result = sut.TryBuildMediaFolderAncestorsTree(item, ToArray(root1, root2, root3)).ToArray();

            // assert
            result.Select(m => m.DisplayName).Should().Equal(
                "Root1",
                "Root2",
                "r2 > 1",
                "r2 > 1 > 1",
                "r2 > 2",
                "Root3");
        }

        [Theory, AutoNData]
        internal void TryBuildMediaFolderAncestorsTree_ShouldOnlyReturnAncestorsTillPassedRootItem(
            HorizonItemTreeBuilder sut,
            Generator<FakeItem> itemGenerator
        )
        {
            var root = itemGenerator.CreateTree(
                new("Root")
                {
                    new("1")
                    {
                        new("1 > 1"),
                        new("1 > 2"),
                        new("1 > 3"),
                    },
                    new("2")
                    {
                        new("2 > 1"),
                        new("2 > 2")
                        {
                            new("2 > 2 > 1"),
                            new("2 > 2 > 2"),
                            new("2 > 2 > 3"),
                        },
                        new("2 > 3"),
                        new("2 > 4"),
                    },
                    new("3")
                    {
                        new("3 > 1"),
                        new("3 > 2"),
                        new("3 > 3")
                        {
                            new("3 > 3 > 1"),
                            new("3 > 3 > 2"),
                            new("3 > 3 > 3"),
                        },
                        new("3 > 4"),
                    }
                });

            var item = root.ToSitecoreItem().FindByName("2 > 2 > 2");
            var customRoot = root.ToSitecoreItem().FindByName("2");

            var result = sut.TryBuildMediaFolderAncestorsTree(item, ToArray(customRoot));

            // assert
            result.Select(m => m.DisplayName).Should().Equal(
                "2",
                "2 > 1",
                "2 > 2",
                "2 > 2 > 1",
                "2 > 2 > 2",
                "2 > 2 > 3",
                "2 > 3",
                "2 > 4");
        }

        private static T[] ToArray<T>(params T[] elements) => elements;
    }
}
