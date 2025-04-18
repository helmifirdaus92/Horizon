// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Globalization;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Mutations;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Publishing;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.NSubstituteUtils;
using Xunit;
using Version = Sitecore.Data.Version;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Mutations
{
    public class HorizonPublishingMutationsTests
    {
        [Theory]
        [AutoNData]
        internal void PublishItem_ShouldThrowInsufficientPrivileges_WhenUserHasCanNotPublish(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            HorizonPublishingMutations sut,
            string site,
            FakeItem fakeItem
        )
        {
            // arrange
            PublishItemInput input = new()
            {
                Language = "en",
                Site = site
            };

            itemPermissionChecker.CanPublish(fakeItem, sitecoreContext.User).Returns(false);
            var item = fakeItem.ToSitecoreItem();

            itemHelper.Configure().GetItem(input.ItemId).Returns(item);

            // act and assert
            sut.Invoking(s => s.ResolveFieldValue(
                    "publishItem",
                    c => c
                        .WithArg("input", input))).Should().Throw<HorizonGqlError>()
                .WithErrorCode(GenericErrorCodes.InsufficientPrivileges);
        }

        [Theory]
        [AutoNData]
        internal void SetPublishingSettings_ShouldSetPublishingSettingsAndReturnItemVersion(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IHorizonMutationHelper itemMutationHelper,
            HorizonPublishingMutations sut,
            string path,
            string site,
            FakeItem fakeItem,
            int versionNumber,
            string newVersionName
        )
        {
            // arrange
            SetPublishingSettingsInput input = new()
            {
                Path = path,
                Site = site,
                VersionNumber = versionNumber,
                Language = "en",
                ValidFromDate = "10/22/2021, 9:00:00 AM",
                ValidToDate = "11/22/2021, 9:00:00 AM"
            };

            fakeItem.WithItemEditing();
            fakeItem.WithPublishing();
            fakeItem.WithField(FieldIDs.ValidFrom, "");
            fakeItem.WithField(FieldIDs.ValidTo, "");
            var item = fakeItem.ToSitecoreItem();

            itemHelper.Configure().GetItem(input.Path, Arg.Any<Version>()).Returns(item);
            itemHelper.Configure().SetItemVersionName(item, newVersionName).Returns(item);

            // act
            var field = sut.ResolveFieldValue<SetPublishingSettingsResult>(
                "setPublishingSettings",
                c => c
                    .WithArg("input", input));

            // assert
            itemMutationHelper.Received(1).VerifyCanEditField(item, FieldIDs.ValidFrom);
            itemMutationHelper.Received(1).VerifyCanEditField(item, FieldIDs.ValidTo);
            field.item.Publishing.ValidFrom.Should().Be(DateUtil.ToUniversalTime(DateTime.Parse(input.ValidFromDate, DateTimeFormatInfo.InvariantInfo)));
            field.item.Publishing.ValidTo.Should().Be(DateUtil.ToUniversalTime(DateTime.Parse(input.ValidToDate, DateTimeFormatInfo.InvariantInfo)));
        }

        [Theory]
        [AutoNData]
        internal void SetPublishingSettings_ShouldFallbackToMinMaxDate_WhenSpecifiedValueIsNotCorrectDateTime(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IHorizonMutationHelper itemMutationHelper,
            HorizonPublishingMutations sut,
            string path,
            string site,
            FakeItem fakeItem,
            int versionNumber,
            string newVersionName
        )
        {
            // arrange
            SetPublishingSettingsInput input = new()
            {
                Path = path,
                Site = site,
                VersionNumber = versionNumber,
                Language = "en",
                ValidFromDate = "", // empty string
                ValidToDate = "non empty string"
            };

            fakeItem.WithItemEditing();
            fakeItem.WithPublishing();
            fakeItem.WithField(FieldIDs.ValidFrom, "");
            fakeItem.WithField(FieldIDs.ValidTo, "");
            var item = fakeItem.ToSitecoreItem();

            itemHelper.Configure().GetItem(input.Path, Arg.Any<Version>()).Returns(item);
            itemHelper.Configure().SetItemVersionName(item, newVersionName).Returns(item);

            // act
            var field = sut.ResolveFieldValue<SetPublishingSettingsResult>(
                "setPublishingSettings",
                c => c
                    .WithArg("input", input));

            // assert
            itemMutationHelper.Received(1).VerifyCanEditField(item, FieldIDs.ValidFrom);
            itemMutationHelper.Received(1).VerifyCanEditField(item, FieldIDs.ValidTo);
            field.item.Publishing.ValidFrom.Should().Be(DateTime.MinValue);
            field.item.Publishing.ValidTo.Should().Be(DateTime.MaxValue);
        }
    }
}
