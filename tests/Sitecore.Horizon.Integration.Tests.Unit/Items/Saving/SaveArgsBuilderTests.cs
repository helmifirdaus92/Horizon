// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using AutoFixture.Xunit2;
using FluentAssertions;
using Newtonsoft.Json;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Saving;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Items.Saving
{
    public class SaveArgsBuilderTests
    {
        [Theory, AutoNData]
        internal void ShouldUseProvidedItemVersion(
            [Frozen] IHorizonItemHelper itemHelper,
            SaveArgsBuilder sut,
            SaveItemDetails saveItemDetails,
            Version itemVersion,
            Item item)
        {
            saveItemDetails.ItemVersion = itemVersion.Number;
            saveItemDetails.ItemLanguage = null;
            itemHelper.Configure().GetItem(item.ID.ToString(), itemVersion).Returns(item);

            saveItemDetails.ItemId = item.ID.ToString();
            saveItemDetails.Fields = null;
            saveItemDetails.PresentationDetails = null;

            // act
            sut.BuildSaveArgs(new[]
            {
                saveItemDetails
            });

            // assert
            itemHelper.Received().GetItem(item.ID.ToString(), itemVersion, ItemScope.ContentOnly);
        }

        [Theory, AutoNData]
        internal void ShouldUseLateVersionIfItemVersionNotProvided(
            [Frozen] IHorizonItemHelper itemHelper,
            SaveArgsBuilder sut,
            SaveItemDetails saveItemDetails,
            Version itemVersion,
            Item item)
        {
            saveItemDetails.ItemVersion = null;
            saveItemDetails.ItemLanguage = null;
            itemHelper.Configure().GetItem(item.ID.ToString(), itemVersion).Returns(item);

            saveItemDetails.ItemId = item.ID.ToString();
            saveItemDetails.Fields = null;
            saveItemDetails.PresentationDetails = null;

            // act
            sut.BuildSaveArgs(new[]
            {
                saveItemDetails
            });

            // assert
            itemHelper.Received().GetItem(item.ID.ToString(), Version.Latest, ItemScope.ContentOnly);
        }

        [Theory, AutoNData]
        internal void PresentationDetailsShouldBeMappedAsFinalLayoutField(
            [Frozen] IHorizonItemUtil itemUtil,
            [Frozen] IHorizonItemHelper itemHelper,
            SaveArgsBuilder sut,
            PresentationDetails presentationDetails,
            SaveItemDetails saveItemDetails,
            string layoutDelta,
            Item item)
        {
            itemHelper.Configure().GetItem(item.ID.ToString()).Returns(item);
            saveItemDetails.ItemId = item.ID.ToString();
            saveItemDetails.ItemLanguage = "en";
            saveItemDetails.Fields = null;

            saveItemDetails.PresentationDetails.Body = JsonConvert.SerializeObject(presentationDetails);
            saveItemDetails.PresentationDetails.Kind = LayoutKind.Final;
            itemUtil.BuildLayoutDelta(Any.Arg<Field>(), Any.String).Returns(layoutDelta);

            // act
            var result = sut.BuildSaveArgs(new[]
            {
                saveItemDetails
            });

            // assert
            var fields = result.Items.Single().Fields;
            fields.Should().HaveCountGreaterThan(0);
            fields.Count(field => field.ID == FieldIDs.FinalLayoutField).Should().Be(1);
            fields.Count(field => field.ID == FieldIDs.LayoutField).Should().Be(0);
        }

        [Theory, AutoNData]
        internal void PresentationDetailsShouldBeMappedAsSharedLayoutField(
            [Frozen] IHorizonItemUtil itemUtil,
            [Frozen] IHorizonItemHelper itemHelper,
            SaveArgsBuilder sut,
            PresentationDetails presentationDetails,
            SaveItemDetails saveItemDetails,
            string layoutDelta,
            Item item)
        {
            itemHelper.Configure().GetItem(item.ID.ToString()).Returns(item);
            saveItemDetails.ItemId = item.ID.ToString();
            saveItemDetails.ItemLanguage = null;
            saveItemDetails.Fields = null;

            saveItemDetails.PresentationDetails.Body = JsonConvert.SerializeObject(presentationDetails);
            saveItemDetails.PresentationDetails.Kind = LayoutKind.Shared;
            itemUtil.BuildLayoutDelta(Any.Arg<Field>(), Any.String).Returns(layoutDelta);

            // act
            var result = sut.BuildSaveArgs(new[]
            {
                saveItemDetails
            });

            // assert
            var fields = result.Items.Single().Fields;
            fields.Should().HaveCountGreaterThan(0);
            fields.Count(field => field.ID == FieldIDs.LayoutField).Should().Be(1);
            fields.Count(field => field.ID == FieldIDs.FinalLayoutField).Should().Be(0);
        }

        [Theory, AutoNData]
        internal void PresentationDetailsShouldNotBeMappedWhenNull(
            [Frozen] IHorizonItemHelper itemHelper,
            SaveArgsBuilder sut,
            SaveItemDetails saveItemDetails,
            Item item)
        {
            itemHelper.Configure().GetItem(item.ID.ToString()).Returns(item);
            saveItemDetails.ItemId = item.ID.ToString();
            saveItemDetails.ItemLanguage = null;
            saveItemDetails.Fields = null;

            saveItemDetails.PresentationDetails = null;

            // act
            var result = sut.BuildSaveArgs(new[]
            {
                new SaveItemDetails()
            });

            // assert
            var fields = result.Items.Single().Fields;
            fields.Count(field => field.ID == FieldIDs.LayoutField).Should().Be(0);
            fields.Count(field => field.ID == FieldIDs.FinalLayoutField).Should().Be(0);
        }
    }
}
