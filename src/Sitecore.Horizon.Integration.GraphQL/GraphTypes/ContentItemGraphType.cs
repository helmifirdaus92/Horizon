// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using GraphQL.Language.AST;
using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Data;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Languages;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal abstract class ContentItemGraphType : ObjectGraphType<Item>
    {
        protected readonly IHorizonItemHelper _itemHelper;
        protected readonly ISitecoreContext _scContext;
        protected readonly IHorizonItemTreeBuilder _itemTreeBuilder;
        protected readonly IHorizonWorkflowManager _workflowManager;
        protected readonly IClientLanguageService _clientLanguageService;

        public ContentItemGraphType(bool implementContentInterface, IHorizonItemHelper itemHelper, ISitecoreContext scContext, IHorizonWorkflowManager workflowManager, IClientLanguageService clientLanguageService, IHorizonItemTreeBuilder itemTreeBuilder)
        {
            _itemHelper = itemHelper;
            _workflowManager = workflowManager;
            _clientLanguageService = clientLanguageService;
            _scContext = scContext;
            _itemTreeBuilder = itemTreeBuilder;

            Name = "ContentItem";

            if (implementContentInterface)
            {
                Interface<ContentInterfaceGraphType>();
            }

            Field<NonNullGraphType<StringGraphType>>(
                "id",
                resolve: context => context.Source.ID
            );

            Field<NonNullGraphType<StringGraphType>>(
                "name",
                resolve: context => context.Source.Name
            );

            Field<NonNullGraphType<StringGraphType>>(
                "versionName",
                resolve: context => context.Source.Fields[FieldIDs.VersionName]?.Value ?? ""
            );

            Field<NonNullGraphType<StringGraphType>>(
                "displayName",
                resolve: context => context.Source.DisplayName
            );

            Field<NonNullGraphType<StringGraphType>>(
                "createdBy",
                resolve: context => context.Source.Security.GetOwner()
            );

            Field<NonNullGraphType<StringGraphType>>(
                "creationDate",
                resolve: context => context.Source.Statistics.Created
            );

            Field<NonNullGraphType<StringGraphType>>(
                "revision",
                resolve: context => context.Source.Statistics.Revision
            );

            Field<NonNullGraphType<StringGraphType>>(
                "updatedBy",
                resolve: context => context.Source.Statistics.UpdatedBy
            );

            Field<NonNullGraphType<StringGraphType>>(
                "updatedDate",
                resolve: context => context.Source.Statistics.Updated
            );

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ContentInterfaceGraphType>>>>(
                "children",
                resolve: ctx => ResolveChildren(
                    item: ctx.Source,
                    queryContext: ctx.GetHorizonUserContext())
            );

            Field<NonNullGraphType<BooleanGraphType>>(
                "hasChildren",
                resolve: ctx => ResolveHasChildren(
                    item: ctx.Source,
                    queryContext: ctx.GetHorizonUserContext())
            );

            Field<NonNullGraphType<TemplateGraphType>>(
                "template",
                resolve: context => context.Source.Template
            );

            Field<NonNullGraphType<IntGraphType>>(
                "version",
                resolve: context => context.Source.Version.Number);

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ContentInterfaceGraphType>>>>(
                "versions",
                resolve: ctx => ctx.Source.Versions.GetVersions());

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ContentInterfaceGraphType>>>>(
                "versionsAll",
                resolve: ctx => ctx.Source.Versions.GetVersions(ctx.GetArgument<bool>("includeAllLanguages")),
                arguments: new QueryArguments(new QueryArgument<BooleanGraphType>
                {
                    Name = "includeAllLanguages",
                    Description = "Controls whether versions from all the languages should be included. When disabled only versions from current language will be returned.",
                    DefaultValue = false
                }));

            Field<NonNullGraphType<StringGraphType>>(
                "icon",
                resolve: context => context.Source[FieldIDs.Icon]
            );

            Field<NonNullGraphType<StringGraphType>>(
                "path",
                resolve: context => context.Source.Paths.FullPath);

            Field<NonNullGraphType<StringGraphType>>(
                "language",
                resolve: context => context.Source.Language.Name);

            Field<ContentInterfaceGraphType>(
                "parent",
                resolve: ctx => ctx.Source.Parent);

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ContentInterfaceGraphType>>>>(
                "ancestors",
                resolve: ctx => ResolveAncestors(ctx.Source)
            );

            Field<WorkflowStateGraphType>(
                "workflow",
                resolve: ctx => GetItemWorkflowInfo(ctx.Source));

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<InsertOptionInterfaceGraphType>>>>(
                name: "insertOptions",
                resolve: ctx => ResolveInsertOptions(
                    item: ctx.Source,
                    kind: ctx.GetArgument<InsertOptionKind>("kind")),
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<EnumerationGraphType<InsertOptionKind>>>
                {
                    Name = "kind",
                    Description = "Kind of insert options to return"
                }));

            Field<NonNullGraphType<ContentItemPermissionsGraphType>>("permissions", resolve: ctx => ctx.Source);

            Field<NonNullGraphType<ContentItemLockingGraphType>>("locking", resolve: ctx => ctx.Source);

            Field<NonNullGraphType<ContentItemPublishingGraphType>>("publishing", resolve: ctx => ctx.Source.Publishing);
            Field<BooleanGraphType>("isLatestPublishableVersion", resolve: ctx => IsLatestPublishableVersion(ctx.Source));
        }

        private IEnumerable<Item> ResolveChildren(Item item, HorizonQueryContext queryContext)
        {
            return queryContext.HorizonOnlyItems
                ? item.Children.Where(_itemHelper.IsHorizonItem)
                : item.Children;
        }

        private bool ResolveHasChildren(Item item, HorizonQueryContext queryContext)
        {
            return queryContext.HorizonOnlyItems
                ? item.Children.Any(_itemHelper.IsHorizonItem)
                : item.Children.Any();
        }

        private IEnumerable<Item> ResolveAncestors(Item item)
        {
            var rootItem = _itemHelper.GetItem(_scContext.Site?.RootPath ?? "") ?? throw new HorizonGqlError(ItemErrorCode.RootNotFound);
            return _itemTreeBuilder.BuildAncestorsTreeFlat(item, rootItem);
        }


        private ItemWorkflowInfo? GetItemWorkflowInfo(Item item)
        {
            _clientLanguageService.ApplyClientLanguage();

            return _workflowManager.GetItemWorkflowInfo(item);
        }

        private IEnumerable<TemplateItem> ResolveInsertOptions(Item item, InsertOptionKind kind)
        {
            _clientLanguageService.ApplyClientLanguage();

            IEnumerable<TemplateItem> result = _itemHelper.GetInsertOptions(item);
            if (kind != InsertOptionKind.Item)
            {
                result = result.Where(x => GetKind(x) == kind);
            }

            return result;

            InsertOptionKind GetKind(TemplateItem item)
            {
                if (_itemHelper.IsTemplateWithPresentation(item) || _itemHelper.IsBranchTemplateWithPresentation(item))
                {
                    return InsertOptionKind.Page;
                }

                if (_itemHelper.IsFolderTemplate(item))
                {
                    return InsertOptionKind.Folder;
                }

                return InsertOptionKind.Item;
            }
        }

        private bool IsLatestPublishableVersion(Item version)
        {
            bool enableWorkflow = _scContext.Site!.EnableWorkflow;
            var latestPublishableVersion = version.Publishing.GetValidVersion(DateTime.UtcNow, enableWorkflow);

            return latestPublishableVersion != null && latestPublishableVersion.Version == version.Version;
        }
    }
}
