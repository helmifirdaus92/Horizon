// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Data;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Languages;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class RawItemGraphType : ContentItemGraphType
    {
        public RawItemGraphType(IHorizonItemHelper itemHelper, ISitecoreContext scContext, IHorizonWorkflowManager workflowManager, IClientLanguageService clientLanguageService, IHorizonItemTreeBuilder itemTreeBuilder)
            : base(implementContentInterface: false, itemHelper, scContext, workflowManager, clientLanguageService, itemTreeBuilder)
        {
            Name = "RawContentItem";

            var childrenField = GetField("children");
            childrenField.Type = typeof(ListGraphType<RawItemGraphType>);

            var insertOptionsField = GetField("insertOptions");
            insertOptionsField.Arguments = new QueryArguments(new QueryArgument<NonNullGraphType<EnumerationGraphType<InsertOptionKind>>>
            {
                Name = "kind",
                Description = "Kind of insert options to return",
                DefaultValue = InsertOptionKind.Item
            });

            var parentField = GetField("parent");
            parentField.Type = typeof(RawItemGraphType);

            Field<StringGraphType>(
                "parentId",
                resolve: context => context.Source.ParentID);

            Field<NonNullGraphType<BooleanGraphType>>(
                "isFolder",
                resolve: context => itemHelper.IsFolder(context.Source));

            Field<ListGraphType<RawItemGraphType>>(
                "ancestorsWithSiblings",
                arguments: new QueryArguments(
                    new QueryArgument<ListGraphType<NonNullGraphType<StringGraphType>>>
                    {
                        Name = "roots",
                        Description = "Roots for the items to retrieve"
                    }
                ),
                resolve: ctx => GetAncestorsWithSiblings(
                    rootPaths: ctx.GetArgument<string[]?>("roots"),
                    ctxSource: ctx.Source),
                description: "Ancestors tree with siblings for the raw item starting from root inclusively"
            );

            Field<NonNullGraphType<StringGraphType>>(
                "url",
                resolve: ctx => itemHelper.GenerateLinkWithoutLanguage(ctx.Source)
            );
        }

        private IEnumerable<Item> GetAncestorsWithSiblings(string[]? rootPaths, Item ctxSource)
        {
            Item[] roots;
            if (rootPaths == null || rootPaths.Length == 0)
            {
                roots = new[]
                {
                    _itemHelper.GetItem(ItemIDs.ContentRoot) ?? throw new HorizonGqlError(GenericErrorCodes.UnknownError, "Content root is not reachable")
                };
            }
            else
            {
                roots = rootPaths.Select(p => _itemHelper.GetItem(p) ?? throw new HorizonGqlError(ItemErrorCode.RootNotFound)).ToArray();
            }

            var result = _itemTreeBuilder.AncestorsWithSiblingsTreeFlat(ctxSource, roots);
            if (result == null)
            {
                throw new HorizonGqlError(ItemErrorCode.RootNotReachable);
            }

            return result;
        }
    }
}
