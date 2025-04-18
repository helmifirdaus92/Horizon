// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Mutations;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Mutations
{
    public class HorizonMutationHelperTests
    {
        [Theory]
        [AutoNData]
        internal void VerifyCanEditField_ShouldNotThrowException_WhenUserCanEditField(
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] BaseTemplateManager templateManager,
            HorizonMutationHelper sut,
            FakeItem fakeItem,
            ID field
        )
        {
            // arrange
            fakeItem.WithItemLocking();
            fakeItem.WithAppearance();
            fakeItem.WithField(field, "");
            var item = fakeItem.ToSitecoreItem();

            templateManager.IsFieldPartOfTemplate(Any.ID, item).Returns(true);
            scContext.User.IsAdministrator.Returns(false);
            itemPermissionChecker.CanWrite(item, scContext.User).Returns(true);
            itemPermissionChecker.CanWriteItemLanguage(item, scContext.User).Returns(true);
            item.Fields[field].Configure().CanUserWrite(scContext.User).Returns(true);

            // act and assert
            sut.Invoking(s => s.VerifyCanEditField(item, field)).Should().NotThrow();
        }

        [Theory]
        [AutoNData]
        internal void VerifyCanEditField_ShouldThrowException_WhenUserDoesNotHaveWritePermission(
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] BaseTemplateManager templateManager,
            HorizonMutationHelper sut,
            FakeItem fakeItem,
            ID field
        )
        {
            // arrange
            fakeItem.WithItemLocking();
            fakeItem.WithAppearance();
            fakeItem.WithField(field, "");
            var item = fakeItem.ToSitecoreItem();

            templateManager.IsFieldPartOfTemplate(Any.ID, item).Returns(true);
            scContext.User.IsAdministrator.Returns(false);
            itemPermissionChecker.CanWrite(item, scContext.User).Returns(false);
            itemPermissionChecker.CanWriteItemLanguage(item, scContext.User).Returns(true);
            item.Fields[field].Configure().CanUserWrite(scContext.User).Returns(true);

            // act and assert
            sut.Invoking(s => s.VerifyCanEditField(item, field)).Should().Throw<HorizonGqlError>();
        }

        [Theory]
        [AutoNData]
        internal void VerifyCanEditField_ShouldThrowException_WhenFieldIsNotPartOfTemplate(
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            HorizonMutationHelper sut,
            FakeItem fakeItem,
            ID field
        )
        {
            // arrange
            fakeItem.WithItemLocking();
            fakeItem.WithAppearance();
            fakeItem.WithField(field, "");
            var item = fakeItem.ToSitecoreItem();
            
            scContext.User.IsAdministrator.Returns(false);
            itemPermissionChecker.CanWrite(item, scContext.User).Returns(false);
            itemPermissionChecker.CanWriteItemLanguage(item, scContext.User).Returns(true);
            item.Fields[field].Configure().CanUserWrite(scContext.User).Returns(true);

            // act and assert
            sut.Invoking(s => s.VerifyCanEditField(item, field)).Should().Throw<HorizonGqlError>();
        }

        [Theory]
        [AutoNData]
        internal void VerifyCanEditField_ShouldThrowException_WhenItemIsFallback(
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] BaseTemplateManager templateManager,
            HorizonMutationHelper sut,
            FakeItem fakeItem,
            ID field
        )
        {
            // arrange
            fakeItem.WithItemLocking();
            fakeItem.WithAppearance();
            fakeItem.WithField(field, "");
            var item = fakeItem.ToSitecoreItem();
            item.IsFallback.Returns(true);

            templateManager.IsFieldPartOfTemplate(Any.ID, item).Returns(true);
            scContext.User.IsAdministrator.Returns(false);
            itemPermissionChecker.CanWrite(item, scContext.User).Returns(true);
            itemPermissionChecker.CanWriteItemLanguage(item, scContext.User).Returns(true);
            item.Fields[field].Configure().CanUserWrite(scContext.User).Returns(true);

            // act and assert
            sut.Invoking(s => s.VerifyCanEditField(item, field)).Should().Throw<HorizonGqlError>();
        }

        [Theory]
        [AutoNData]
        internal void VerifyCanEditField_ShouldNotThrowException_WhenFallbackIsAllowed(
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] BaseTemplateManager templateManager,
            HorizonMutationHelper sut,
            FakeItem fakeItem,
            ID field
        )
        {
            // arrange
            fakeItem.WithItemLocking();
            fakeItem.WithAppearance();
            fakeItem.WithField(field, "");
            var item = fakeItem.ToSitecoreItem();
            item.IsFallback.Returns(true);

            templateManager.IsFieldPartOfTemplate(Any.ID, item).Returns(true);
            scContext.User.IsAdministrator.Returns(false);
            itemPermissionChecker.CanWrite(item, scContext.User).Returns(true);
            itemPermissionChecker.CanWriteItemLanguage(item, scContext.User).Returns(true);
            item.Fields[field].Configure().CanUserWrite(scContext.User).Returns(true);

            // act and assert
            sut.Invoking(s => s.VerifyCanEditField(item, field, allowFallback: true)).Should().NotThrow();
        }
    }
}
