// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Horizon.Integration.Presentation.Mapper;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Layouts;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Presentation
{
    public class PresentationDetailsRepositoryTests
    {
        [Theory, AutoNData]
        internal void GetItemPresentationDetails_ShouldReturnMappedPresentationDetails(
            [Frozen] ILayoutDefinitionMapper layoutDefinitionMapper,
            [Frozen] IHorizonItemUtil itemUtil,
            PresentationDetailsRepository sut,
            PresentationDetails presentationDetails,
            string finalLayoutValue,
            LayoutDefinition layoutDefinition
        )
        {
            // arrange
            Item item = new FakeItem().WithField(FieldIDs.FinalLayoutField, finalLayoutValue).ToSitecoreItem();
            itemUtil.GetItemFinalLayout(item).Returns(layoutDefinition);
            layoutDefinitionMapper.Configure().MapLayoutDefinition(Arg.Any<LayoutDefinition>()).Returns(presentationDetails);

            // act
            var result = sut.GetItemPresentationDetails(item);

            // assert
            result.Should().NotBeNull();
            result.Should().BeSameAs(presentationDetails);
        }

        [Theory, AutoNData]
        internal void GetItemPresentationDetails_ShouldThrowOnNullItem(PresentationDetailsRepository sut)
        {
            //act & assert
            sut.Invoking(s => s.GetItemPresentationDetails(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void GetItemSharedPresentationDetails_ShouldReturnMappedPresentationDetails(
            [Frozen] ILayoutDefinitionMapper layoutDefinitionMapper,
            [Frozen] IHorizonItemUtil itemUtil,
            PresentationDetailsRepository sut,
            PresentationDetails presentationDetails,
            string sharedLayoutValue,
            LayoutDefinition layoutDefinition
        )
        {
            // arrange
            Item item = new FakeItem().WithField(FieldIDs.LayoutField, sharedLayoutValue).ToSitecoreItem();
            itemUtil.GetItemSharedLayout(item).Returns(layoutDefinition);
            layoutDefinitionMapper.Configure().MapLayoutDefinition(Arg.Any<LayoutDefinition>()).Returns(presentationDetails);

            // act
            var result = sut.GetItemSharedPresentationDetails(item);

            // assert
            result.Should().NotBeNull();
            result.Should().BeSameAs(presentationDetails);
        }

    }
}
