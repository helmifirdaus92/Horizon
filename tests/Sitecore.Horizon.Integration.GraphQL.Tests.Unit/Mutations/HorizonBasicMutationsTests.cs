// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Mutations;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.AddVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Create;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Delete;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteItemVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteLayoutRules;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.RenameItemVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.SetLayoutKind;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Saving;
using Sitecore.Horizon.Integration.Personalization;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Mutations
{
    public class HorizonBasicMutationsTests
    {
        [Theory]
        [AutoNData]
        internal void HorizonMutations_DuplicateItem_ShouldDuplicateAndReturnNewItem(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] ISitecoreContext sitecoreContext,
            HorizonBasicMutations sut,
            string newItemName,
            string sourceItemId,
            string site,
            FakeItem fakeSourceItem,
            FakeItem fakeSourceItemParent,
            FakeItem fakeNewItem
        )
        {
            // arrange
            DuplicateItemInput input = new()
            {
                SourceItemId = sourceItemId,
                NewItemName = newItemName,
                Language = "en",
                Site = site
            };

            fakeSourceItemParent.WithItemAccess();
            fakeSourceItem.WithParent(fakeSourceItemParent);
            var item = fakeSourceItem.ToSitecoreItem();
            item.Parent.Access.Configure().CanCreate().Returns(true);

            itemHelper.Configure().GetItem(input.SourceItemId).Returns(item);
            itemHelper.Configure().GetItem(item.ParentID).Returns(item.Parent);
            var newItem = fakeNewItem.ToSitecoreItem();
            sitecoreContext.Configure().WorkflowDuplicateItem(item, Arg.Any<string>()).Returns(newItem);

            // act and assert
            var field = sut.ResolveFieldValue<CreateItemResult>(
                "duplicateItem",
                c => c
                    .WithArg("input", input));

            sitecoreContext.Received(1).WorkflowDuplicateItem(item, newItemName);
            field.Item.Should().BeEquivalentTo(newItem);
        }


        [Theory]
        [AutoNData]
        internal void HorizonMutations_DuplicateItem_ShouldThrowInsufficientPrivileges_WhenParentHasNoCreatePermission(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] ISitecoreContext sitecoreContext,
            HorizonBasicMutations sut,
            string newItemName,
            string sourceItemId,
            string site,
            FakeItem fakeSourceItem,
            FakeItem fakeSourceItemParent,
            FakeItem fakeNewItem
        )
        {
            // arrange
            DuplicateItemInput input = new()
            {
                SourceItemId = sourceItemId,
                NewItemName = newItemName,
                Language = "en",
                Site = site
            };

            fakeSourceItemParent.WithItemAccess();
            fakeSourceItem.WithParent(fakeSourceItemParent);
            var item = fakeSourceItem.ToSitecoreItem();
            item.Parent.Access.Configure().CanCreate().Returns(false);

            itemHelper.Configure().GetItem(input.SourceItemId).Returns(item);
            itemHelper.Configure().GetItem(item.ParentID).Returns(item.Parent);
            var newItem = fakeNewItem.ToSitecoreItem();


            // act and assert
            sut.Invoking(s => s.ResolveFieldValue(
                    "duplicateItem",
                    c => c
                        .WithArg("input", input))).Should().Throw<HorizonGqlError>()
                .WithErrorCode(GenericErrorCodes.InsufficientPrivileges);

            sitecoreContext.DidNotReceive().WorkflowDuplicateItem(Any.Item, Any.String);
        }

        [Theory]
        [AutoNData]
        internal void HorizonMutations_RenameItemVersion_ShouldRenameAndReturnItemVersion(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IHorizonMutationHelper horizonMutationHelper,
            HorizonBasicMutations sut,
            string path,
            string site,
            FakeItem fakeItem,
            int versionNumber,
            string newVersionName
        )
        {
            // arrange
            RenameItemVersionInput input = new()
            {
                Path = path,
                Site = site,
                VersionNumber = versionNumber,
                NewName = newVersionName,
                Language = "en"
            };

            fakeItem.WithField(FieldIDs.VersionName, "");
            var item = fakeItem.ToSitecoreItem();

            itemHelper.Configure().GetItem(input.Path, Arg.Any<Version>()).Returns(item);
            itemHelper.Configure().SetItemVersionName(item, newVersionName).Returns(item);

            // act
            var field = sut.ResolveFieldValue<RenameItemVersionResult>(
                "renameItemVersion",
                c => c
                    .WithArg("input", input));

            horizonMutationHelper.Received(1).VerifyCanEditField(item, FieldIDs.VersionName);
            itemHelper.Received(1).SetItemVersionName(item, newVersionName);
            field.ItemVersion.Should().BeEquivalentTo(item);
        }

        [Theory]
        [AutoNData]
        internal void HorizonMutations_AddItemVersion_WithoutOptionalParameters_ShouldAddAndReturnNewVersionItem(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IHorizonMutationHelper horizonMutationHelper,
            HorizonBasicMutations sut,
            string path,
            string site,
            FakeItem fakeItem,
            string itemVersionName,
            Item newItemVersion
        )
        {
            // arrange
            AddItemVersionInput input = new()
            {
                Path = path,
                VersionName = itemVersionName,
                Site = site,
                Language = "en"
            };

            fakeItem.WithField(FieldIDs.VersionName, "");
            var item = fakeItem.ToSitecoreItem();

            itemHelper.Configure().GetItem(input.Path).Returns(item);
            itemHelper.Configure().AddItemVersion(item, itemVersionName).Returns(newItemVersion);

            // act
            var field = sut.ResolveFieldValue<AddItemVersionResult>(
                "addItemVersion",
                c => c
                    .WithArg("input", input));

            horizonMutationHelper.Received(1).VerifyCanEditField(item, FieldIDs.VersionName, true);
            itemHelper.Received(1).AddItemVersion(item, itemVersionName);
            field.Item.Should().BeEquivalentTo(newItemVersion);
        }

        [Theory]
        [AutoNData]
        internal void HorizonMutations_AddItemVersion__WithOptionalBaseVersionNumber_ShouldAddAndReturnNewVersionItem(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IHorizonMutationHelper horizonMutationHelper,
            HorizonBasicMutations sut,
            string path,
            string site,
            FakeItem fakeItem,
            string itemVersionName,
            Item newItemVersion
        )
        {
            // arrange
            AddItemVersionInput input = new()
            {
                Path = path,
                VersionName = itemVersionName,
                Site = site,
                Language = "en",
                BaseVersionNumber = 3
            };
            fakeItem.WithField(FieldIDs.VersionName, "");
            var item = fakeItem.ToSitecoreItem();

            itemHelper.Configure().GetItem(input.Path, Arg.Any<Version>()).Returns(item);
            itemHelper.Configure().AddItemVersion(item, itemVersionName).Returns(newItemVersion);

            // act and assert
            var field = sut.ResolveFieldValue<AddItemVersionResult>(
                "addItemVersion",
                c => c
                    .WithArg("input", input));

            horizonMutationHelper.Received(1).VerifyCanEditField(item, FieldIDs.VersionName, true);
            itemHelper.Received(1).AddItemVersion(item, itemVersionName);
            field.Item.Should().BeEquivalentTo(newItemVersion);
        }

        [Theory]
        [AutoNData]
        internal void HorizonMutations_AddItemVersion_ShouldThrowHorizonGqlErrorIfUserIsNotAllowedToEditField(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IHorizonMutationHelper horizonMutationHelper,
            HorizonBasicMutations sut,
            string path,
            string versionName,
            string site,
            FakeItem fakeItem,
            string itemVersionName,
            Item newItemVersion
        )
        {
            // arrange
            AddItemVersionInput input = new()
            {
                Path = path,
                VersionName = versionName,
                Site = site,
                Language = "en"
            };

            fakeItem.WithField(FieldIDs.VersionName, "");
            var item = fakeItem.ToSitecoreItem();

            horizonMutationHelper.When(h => h.VerifyCanEditField(item, FieldIDs.VersionName, true)).Do(_ => throw new HorizonGqlError(GenericErrorCodes.InsufficientPrivileges));
            itemHelper.Configure().GetItem(input.Path).Returns(item);
            itemHelper.Configure().AddItemVersion(item, itemVersionName).Returns(newItemVersion);

            // act and assert
            sut.Invoking(s => s.ResolveFieldValue(
                    "addItemVersion",
                    c => c
                        .WithArg("input", input))).Should().Throw<HorizonGqlError>()
                .WithErrorCode(GenericErrorCodes.InsufficientPrivileges);

            itemHelper.DidNotReceive().AddItemVersion(Any.Item, Any.String);
        }


        [Theory]
        [AutoNData]
        internal void HorizonMutations_DeleteItem_ShouldDeleteItem(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            HorizonBasicMutations sut,
            string path,
            string site,
            Item itemToDelete
        )
        {
            // arrange
            DeleteItemInput input = new()
            {
                Path = path,
                Site = site,
                Language = "en"
            };

            itemHelper.Configure().GetItem(input.Path, ItemScope.ContentOnly).Returns(itemToDelete);
            itemPermissionChecker.CanDelete(itemToDelete, scContext.User).Returns(true);

            // act and assert
            var field = sut.ResolveFieldValue<DeleteItemResult>(
                "deleteItem",
                c => c
                    .WithArg("input", input));

            scContext.Received(1).SetQueryContext("en", site);
            itemHelper.Received(1).DeleteItem(itemToDelete);
        }

        [Theory]
        [AutoNData]
        internal void HorizonMutations_DeleteItemVersion_ShouldDeleteVersionAndReturnLatestPublishableVersion(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            HorizonBasicMutations sut,
            string path,
            int versionNumber,
            string site,
            Item itemVersionToDelete,
            Item latestPublishableItemVersion
        )
        {
            // arrange
            DeleteItemVersionInput input = new()
            {
                Path = path,
                VersionNumber = versionNumber,
                Site = site,
                Language = "en"
            };

            itemHelper.Configure().GetItem(input.Path, Arg.Any<Version>()).Returns(itemVersionToDelete);
            itemPermissionChecker.CanWrite(itemVersionToDelete, scContext.User).Returns(true);
            itemPermissionChecker.CanDelete(itemVersionToDelete, scContext.User).Returns(true);
            itemHelper.Configure().GetItem(input.Path).Returns(latestPublishableItemVersion);

            // act and assert
            var field = sut.ResolveFieldValue<DeleteItemVersionResult>(
                "deleteItemVersion",
                c => c
                    .WithArg("input", input));

            itemHelper.Received(1).DeleteItemVersion(itemVersionToDelete);
            scContext.Received(1).SetQueryContext("en", site);
            field.LatestPublishableVersion.Should().BeEquivalentTo(latestPublishableItemVersion);
        }

        [Theory]
        [InlineAutoNData(true, false)]
        [InlineAutoNData(false, true)]
        [InlineAutoNData(false, false)]
        internal void HorizonMutations_DeleteItemVersion_ShouldThrowHorizonGqlErrorIfUserHasInsufficientPrivileges(
            bool canWrite,
            bool cadDelete,
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            HorizonBasicMutations sut,
            string path,
            int versionNumber,
            string site,
            Item itemVersionToDelete
        )
        {
            // arrange
            DeleteItemVersionInput input = new()
            {
                Path = path,
                VersionNumber = versionNumber,
                Site = site,
                Language = "en"
            };

            itemHelper.Configure().GetItem(input.Path, Arg.Any<Version>()).Returns(itemVersionToDelete);
            itemPermissionChecker.CanWrite(itemVersionToDelete, scContext.User).Returns(canWrite);
            itemPermissionChecker.CanDelete(itemVersionToDelete, scContext.User).Returns(cadDelete);

            // act and assert
            sut.Invoking(s => s.ResolveFieldValue(
                    "deleteItemVersion",
                    c => c
                        .WithArg("input", input))).Should().Throw<HorizonGqlError>()
                .WithErrorCode(GenericErrorCodes.InsufficientPrivileges);

            itemHelper.DidNotReceive().AddItemVersion(Any.Item, Any.String);
        }

        [Theory]
        [AutoNData]
        internal void HorizonMutations_DeleteLayoutRules_ShouldDeleteLayoutRulesForSpecifiedVariantId(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IPersonalizationManager personalizationManager,
            [Frozen] ISitecoreContext scContext,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            HorizonBasicMutations sut,
            string path,
            string variantId,
            string site,
            Item item
        )
        {
            // arrange
            DeleteLayoutRulesInput input = new()
            {
                VariantId = variantId,
                Path = path,
                Site = site,
                Language = "en"
            };

            itemHelper.Configure().GetItem(input.Path).Returns(item);
            itemPermissionChecker.CanWrite(item, scContext.User).Returns(true);

            // act and assert
            var field = sut.ResolveFieldValue<DeleteLayoutRulesResult>(
                "deleteLayoutRules",
                c => c
                    .WithArg("input", input));

            personalizationManager.Received(1).DeleteLayoutRules(item, input.VariantId);
            scContext.Received(1).SetQueryContext(input.Language, input.Site);
        }

        [Theory]
        [InlineAutoNData(LayoutKind.Shared)]
        [InlineAutoNData(LayoutKind.Final)]
        internal void HorizonMutations_SetLayoutEditingKind_ShouldSetLayoutEditingSpecifiedKind(
            LayoutKind kind,
            [Frozen] IHorizonMutationHelper iemMutationHelper,
            HorizonBasicMutations sut
        )
        {
            // arrange
            SetLayoutEditingKindInput input = new()
            {
                Kind = kind
            };

            // act and assert
            var field = sut.ResolveFieldValue<SetLayoutEditingKindResult>(
                "setLayoutEditingKind",
                c => c
                    .WithArg("input", input));

            iemMutationHelper.Received(1).SetLayoutEditingKind(kind);
        }
    }
}
