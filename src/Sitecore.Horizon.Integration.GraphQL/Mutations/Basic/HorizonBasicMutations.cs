// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Exceptions;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.AddVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.ChangeDisplayName;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Create;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Delete;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteItemVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteLayoutRules;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Move;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Rename;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.RenameItemVersion;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Save;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.SetLayoutKind;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Saving;
using Sitecore.Horizon.Integration.Personalization;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Version = Sitecore.Data.Version;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic
{
    internal class HorizonBasicMutations : ObjectGraphType
    {
        private readonly IHorizonItemHelper _itemHelper;
        private readonly ISitecoreContext _scContext;
        private readonly IItemPermissionChecker _itemPermissionChecker;
        private readonly ISaveArgsBuilder _saveArgsBuilder;
        private readonly BaseTemplateManager _templateManager;
        private readonly IHorizonPipelines _horizonPipelines;
        private readonly IHorizonMutationHelper _horizonMutationHelper;
        private readonly IPersonalizationManager _personalizationManager;

        public HorizonBasicMutations(IHorizonItemHelper itemHelper,
            ISitecoreContext scContext,
            IItemPermissionChecker itemPermissionChecker,
            ISaveArgsBuilder saveArgsBuilder,
            BaseTemplateManager templateManager,
            IHorizonPipelines horizonPipelines,
            IHorizonMutationHelper horizonMutationHelper,
            IPersonalizationManager personalizationManager)
        {
            _itemHelper = itemHelper;
            _scContext = scContext;
            _itemPermissionChecker = itemPermissionChecker;
            _saveArgsBuilder = saveArgsBuilder;
            _templateManager = templateManager;
            _horizonPipelines = horizonPipelines;
            _horizonMutationHelper = horizonMutationHelper;
            _personalizationManager = personalizationManager;

            Name = "HorizonMutations";

            Field<DeleteItemOutput>(
                "deleteItem",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<DeleteItemInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<DeleteItemInput>("input");
                    return DeleteItem(input.Path, input.Language, input.Site);
                });

            Field<DeleteItemVersionOutput>(
                "deleteItemVersion",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<DeleteItemVersionInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<DeleteItemVersionInput>("input");
                    return DeleteItemVersion(input.Path, input.VersionNumber, input.Language, input.Site);
                });

            Field<RenameItemOutput>(
                "renameItem", arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<RenameItemInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<RenameItemInput>("input");
                    return RenameItem(input.Path, input.NewName, input.Language, input.Site);
                });

            Field<RenameItemVersionOutput>(
                "renameItemVersion", arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<RenameItemVersionInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<RenameItemVersionInput>("input");
                    return RenameItemVersion(input.Path, input.VersionNumber, input.NewName, input.Language, input.Site);
                });

            Field<SaveItemOutput>(
                "saveItem",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<SaveItemInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<SaveItemInput>("input");
                    return SaveItem(input.Items, input.Language, input.Site);
                });

            Field<CreatePageOutput>(
                "createPage",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<CreatePageInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<CreatePageInput>("input");
                    var item = HandleCreateItemRequest(input.PageName, input.TemplateId, input.ParentId, input.Site, input.Language);
                    return new CreateItemResult(item);
                });

            Field<DuplicateItemOutput>(
                "duplicateItem",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<DuplicateItemInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<DuplicateItemInput>("input");
                    var item = HandleDuplicateItemRequest(input.SourceItemId, input.NewItemName, input.Site, input.Language);
                    return new CreateItemResult(item);
                });

            Field<CreateFolderOutput>(
                "createFolder",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<CreateFolderInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<CreateFolderInput>("input");
                    var item = HandleCreateItemRequest(input.FolderName, input.TemplateId, input.ParentId, input.Site, input.Language);
                    return new CreateItemResult(item);
                });

            Field<CreateRawItemOutput>(
                "createRawItem",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<CreateRawItemInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<CreateRawItemInput>("input");
                    var item = HandleCreateItemRequest(input.ItemName, input.TemplateId, input.ParentId, input.Site, input.Language);
                    return new CreateItemResult(item);
                });

            Field<ChangeDisplayNameOutput>(
                "changeDisplayName",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<ChangeDisplayNameInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<ChangeDisplayNameInput>("input");
                    return ChangeDisplayName(input.Path, input.NewDisplayName, input.Language, input.Site);
                });

            Field<MoveItemOutput>(
                "moveItem",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<MoveItemInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<MoveItemInput>("input");
                    return MoveItem(input.ItemToMoveId, input.TargetId, input.Position, input.Site);
                });

            Field<AddItemVersionOutput>(
                "addItemVersion",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<AddItemVersionInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<AddItemVersionInput>("input");
                    return AddItemVersion(input.Path, input.VersionName, input.Language, input.Site, input.BaseVersionNumber);
                });
            Field<DeleteLayoutRulesOutput>(
                "deleteLayoutRules",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<DeleteLayoutRulesInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<DeleteLayoutRulesInput>("input");
                    return DeleteLayoutRules(input.VariantId, input.Path, input.Language, input.Site);
                });

            Field<SetLayoutEditingKindOutput>(
                "setLayoutEditingKind",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<SetLayoutEditingKindInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<SetLayoutEditingKindInput>("input");
                    return SetLayoutEditingKind(input.Site, input.Kind);
                });
        }

        private SetLayoutEditingKindResult SetLayoutEditingKind(string? site, LayoutKind layoutKind)
        {
            // Make site parameter nullable just temporary
            // to avoid braking changes while releasing  XMC and Pages FE
            // TODO - change to mandatory parameter after releases done
            if (site != null)
            {
                _scContext.SetQueryContext(site: site);
            }

            return _horizonMutationHelper.SetLayoutEditingKind(layoutKind);
        }

        private DeleteItemResult DeleteItem(string path, string? language, string? site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            var item = _itemHelper.GetItem(path, scope: ItemScope.ContentOnly) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            if (!_itemPermissionChecker.CanDelete(item, _scContext.User))
            {
                throw new HorizonGqlError(GenericErrorCodes.InsufficientPrivileges);
            }

            _itemHelper.DeleteItem(item);

            return new DeleteItemResult();
        }

        private DeleteItemVersionResult DeleteItemVersion(string path, int version, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            var itemVersionToDelete = _itemHelper.GetItem(path, Version.Parse(version)) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            if (!_itemPermissionChecker.CanWrite(itemVersionToDelete, _scContext.User) || !_itemPermissionChecker.CanDelete(itemVersionToDelete, _scContext.User))
            {
                throw new HorizonGqlError(GenericErrorCodes.InsufficientPrivileges);
            }

            _itemHelper.DeleteItemVersion(itemVersionToDelete);

            var latestPublishableVersion = _itemHelper.GetItem(path) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);
            return new DeleteItemVersionResult(latestPublishableVersion);
        }

        private RenameItemResult RenameItem(string path, string newName, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            var item = _itemHelper.GetItem(path) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            if (!_itemPermissionChecker.CanRename(item, _scContext.User))
            {
                throw new HorizonGqlError(GenericErrorCodes.InsufficientPrivileges);
            }

            using (new EditContext(item))
            {
                item.Name = ItemUtil.ProposeValidItemName(newName);
            }

            return new RenameItemResult(item);
        }

        private RenameItemVersionResult RenameItemVersion(string path, int itemVersion, string newName, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            var item = _itemHelper.GetItem(path, Version.Parse(itemVersion)) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            if (item.Fields[FieldIDs.VersionName] != null)
            {
                _horizonMutationHelper.VerifyCanEditField(item, FieldIDs.VersionName);
                _itemHelper.SetItemVersionName(item, newName);
            }

            return new RenameItemVersionResult(item);
        }

        private ChangeDisplayNameResult ChangeDisplayName(string path, string newDisplayName, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            var item = _itemHelper.GetItem(path) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            _horizonMutationHelper.VerifyCanEditField(item, FieldIDs.DisplayName);

            if (item.Name.Equals(newDisplayName, StringComparison.Ordinal))
            {
                newDisplayName = string.Empty;
            }

            using (new EditContext(item))
            {
                item.Appearance.DisplayName = newDisplayName;
            }

            return new ChangeDisplayNameResult(item);
        }

        private HorizonSaveItemArgs SaveItem(IReadOnlyCollection<SaveItemDetails>? itemEntries, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            if (itemEntries == null || itemEntries.Count == 0)
            {
                throw new HorizonGqlError(GenericErrorCodes.InvalidArgument, "No items provided");
            }

            HorizonSaveItemArgs args = _saveArgsBuilder.BuildSaveArgs(itemEntries);
            if (args.Errors.Count > 0)
            {
                return args;
            }

            // ContentDatabase is required for now, as all the save pipeline processors use it.
            if (_scContext.ContentDatabase == null)
            {
                try
                {
                    _scContext.ContentDatabase = _scContext.Database;

                    _horizonPipelines.SaveItem(ref args);
                }
                finally
                {
                    _scContext.ContentDatabase = null;
                }
            }
            else
            {
                _horizonPipelines.SaveItem(ref args);
            }

            return args;
        }

        private Item HandleCreateItemRequest(string name, string templateId, string parentId, string site, string language)
        {
            _scContext.SetQueryContext(language: language, site: site);

            VerifyAddItemRequestValid(name, parentId, templateId);

            try
            {
                var parent = _itemHelper.GetItem(parentId) ?? throw new HorizonGqlError(ItemErrorCode.InvalidParent);

                //Item.Add() is used because it verifies item name additionally
                //BaseItemManager.AddFromTemplate() doesn't handle duplicate item names on same level
                Item item = parent.Add(name, new TemplateID(new ID(templateId)));
                if (item == null)
                {
                    throw new HorizonGqlError(GenericErrorCodes.UnknownError);
                }

                return item;
            }
            catch (InvalidItemNameException)
            {
                throw new HorizonGqlError(ItemErrorCode.InvalidItemName);
            }
            catch (DuplicateItemNameException)
            {
                throw new HorizonGqlError(ItemErrorCode.DuplicateItemName);
            }
            catch (Exception)
            {
                throw new HorizonGqlError(GenericErrorCodes.UnknownError);
            }

            void VerifyAddItemRequestValid(string name, string parentId, string templateId)
            {
                if (string.IsNullOrEmpty(name))
                {
                    throw new HorizonGqlError(ItemErrorCode.InvalidItemName);
                }

                if (!ID.TryParse(parentId, out var itemParentId) || itemParentId == ID.Null)
                {
                    throw new HorizonGqlError(ItemErrorCode.InvalidParent);
                }

                if (!ID.TryParse(templateId, out var itemTemplateId) || itemTemplateId == ID.Null)
                {
                    throw new HorizonGqlError(ItemErrorCode.InvalidTemplateId);
                }

                Item? parent = _itemHelper.GetItem(parentId);
                if (parent == null)
                {
                    throw new HorizonGqlError(ItemErrorCode.InvalidParent);
                }
            }
        }

        private Item HandleDuplicateItemRequest(string sourceItemID, string newItemName, string site, string language)
        {
            _scContext.SetQueryContext(language: language, site: site);

            var item = _itemHelper.GetItem(sourceItemID, scope: ItemScope.ContentOnly) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);
            var parent = item.Parent ?? throw new HorizonGqlError(ItemErrorCode.InvalidParent);

            if (!parent.Access.CanCreate())
            {
                throw new HorizonGqlError(ItemErrorCode.InsufficientPrivileges);
            }

            try
            {
                var duplicatedItem = _scContext.WorkflowDuplicateItem(item, newItemName);
                _personalizationManager.CleanupPersonalization(duplicatedItem, applyForSubitems: true);

                return duplicatedItem;
            }
            catch (InvalidItemNameException)
            {
                throw new HorizonGqlError(ItemErrorCode.InvalidItemName);
            }
            catch (DuplicateItemNameException)
            {
                throw new HorizonGqlError(ItemErrorCode.DuplicateItemName);
            }
            catch (Exception)
            {
                throw new HorizonGqlError(GenericErrorCodes.UnknownError);
            }
        }

        private MoveItemResult MoveItem(string itemToMovePath, string targetPath, MovePosition position, string site)
        {
            _scContext.SetQueryContext(site: site);

            Item? itemToMove = _itemHelper.GetItem(itemToMovePath);
            if (itemToMove == null)
            {
                throw new HorizonGqlError(MoveItemErrorCode.ItemToMoveDoesNotExist);
            }

            Item? targetItem = _itemHelper.GetItem(targetPath);
            if (targetItem == null)
            {
                throw new HorizonGqlError(MoveItemErrorCode.TargetItemDoesNotExist);
            }

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, position);
            _horizonPipelines.HorizonMoveItem(ref args);

            if (args.Error.HasValue)
            {
                throw new HorizonGqlError(args.Error.Value);
            }

            return new MoveItemResult();
        }

        private AddItemVersionResult AddItemVersion(string path, string versionName, string language, string site, int? baseVersionNumber = null)
        {
            _scContext.SetQueryContext(language, site);

            var item = (baseVersionNumber != null ? _itemHelper.GetItem(path, Version.Parse(baseVersionNumber)) : _itemHelper.GetItem(path))
                ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            if (item.Fields[FieldIDs.VersionName] != null)
            {
                _horizonMutationHelper.VerifyCanEditField(item, FieldIDs.VersionName, allowFallback: true);
            }

            var newItemVersion = _itemHelper.AddItemVersion(item, versionName);
            return new AddItemVersionResult(newItemVersion);
        }

        private DeleteLayoutRulesResult DeleteLayoutRules(string variantId, string path, string language, string site)
        {
            _scContext.SetQueryContext(language, site);

            var item = _itemHelper.GetItem(path) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);
            if (!_itemPermissionChecker.CanWrite(item, _scContext.User))
            {
                throw new HorizonGqlError(GenericErrorCodes.InsufficientPrivileges);
            }

            _personalizationManager.DeleteLayoutRules(item, variantId);

            return new DeleteLayoutRulesResult(item);
        }
    }
}
