// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Data;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Publishing;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Publishing
{
    public class PublishingTargetInfoTests
    {
        [Theory]
        [AutoNData]
        internal void GetTargetDatabases_ShouldReturnSingleTargetDatabase(
            [Frozen] BasePublishManager publishManager,
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] BaseFactory factory,
            PublishingTargetInfo sut,
            string targetDatabaseName,
            string publishingTargetName,
            FakeItem publishingTargetItem
        )
        {
            // arrange
            publishingTargetItem.WithName(publishingTargetName);
            publishingTargetItem.WithField(FieldIDs.PublishingTargetDatabase, targetDatabaseName);

            var mockTargets = new ItemList
            {
                publishingTargetItem
            };

            publishManager.GetPublishingTargets(sitecoreContext.Database).Returns(mockTargets);

            var targetDatabase = FakeUtil.FakeDatabase(targetDatabaseName);
            factory.GetDatabase(targetDatabaseName).Returns(targetDatabase);

            // act
            Database[] databases = sut.GetTargetDatabases();

            // assert
            databases.Should().NotBeNull();
            databases.Should().HaveCount(1);
            databases.Select(x => x.Name).Should().Contain(targetDatabaseName);
        }

        [Theory]
        [AutoNData]
        internal void GetTargetDatabases_ShouldReturnMultipleTargetDatabases(
            [Frozen] BasePublishManager publishManager,
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] BaseFactory factory,
            PublishingTargetInfo sut,
            string targetDatabaseName1,
            string targetDatabaseName2,
            string publishingTargetName1,
            string publishingTargetName2,
            FakeItem publishingTargetItem1,
            FakeItem publishingTargetItem2
        )
        {
            // arrange
            publishingTargetItem1.WithName(publishingTargetName1);
            publishingTargetItem1.WithField(FieldIDs.PublishingTargetDatabase, targetDatabaseName1);

            publishingTargetItem2.WithName(publishingTargetName2);
            publishingTargetItem2.WithField(FieldIDs.PublishingTargetDatabase, targetDatabaseName2);

            var mockTargets = new ItemList
            {
                publishingTargetItem1,
                publishingTargetItem2
            };

            publishManager.GetPublishingTargets(sitecoreContext.Database).Returns(mockTargets);

            var targetDatabase1 = FakeUtil.FakeDatabase(targetDatabaseName1);
            factory.GetDatabase(targetDatabaseName1).Returns(targetDatabase1);

            var targetDatabase2 = FakeUtil.FakeDatabase(targetDatabaseName2);
            factory.GetDatabase(targetDatabaseName2).Returns(targetDatabase2);

            // act
            Database[] databases = sut.GetTargetDatabases();

            // assert
            databases.Should().HaveCount(2);
            databases.Select(x => x.Name).Should().Contain(targetDatabaseName1);
            databases.Select(x => x.Name).Should().Contain(targetDatabaseName2);
        }

        [Theory]
        [AutoNData]
        internal void GetTargetDatabases_ShouldReturnEmptyTargetDatabase(
            [Frozen] BasePublishManager publishManager,
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] BaseFactory factory,
            PublishingTargetInfo sut,
            string publishingTargetName,
            FakeItem publishingTargetItem
        )
        {
            // arrange
            publishingTargetItem.WithName(publishingTargetName);
            publishingTargetItem.WithField(FieldIDs.PublishingTargetDatabase, string.Empty);

            var mockTargets = new ItemList
            {
                publishingTargetItem,
            };

            publishManager.GetPublishingTargets(sitecoreContext.Database).Returns(mockTargets);

            var targetDatabase = FakeUtil.FakeDatabase(string.Empty);
            factory.GetDatabase(string.Empty).Returns(targetDatabase);

            // act
            Database[] databases = sut.GetTargetDatabases();

            // assert
            databases.Should().HaveCount(0);
        }
    }
}
