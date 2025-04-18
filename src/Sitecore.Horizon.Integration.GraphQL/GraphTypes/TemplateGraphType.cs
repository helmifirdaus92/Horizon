// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Schema;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class TemplateGraphType : ObjectGraphType<TemplateItem>
    {
        private readonly BaseTemplateManager _templateManager;

        public TemplateGraphType(BaseTemplateManager templateManager)
        {
            _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));

            Name = "Template";

            Field<NonNullGraphType<StringGraphType>>(
                "id",
                resolve: context => context.Source.ID
            );

            Field<NonNullGraphType<StringGraphType>>(
                "name",
                resolve: context => context.Source.Name
            );

            Field<NonNullGraphType<StringGraphType>>(
                "displayName",
                resolve: context => context.Source.DisplayName
            );

            Field<NonNullGraphType<StringGraphType>>(
                "path",
                resolve: context => context.Source.InnerItem.Paths.FullPath
            );

            Field<TemplateFieldGraphType>(
                "field",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "id",
                        Description = "Template field ID"
                    }),
                resolve: ctx => ResolveTemplateField(
                    id: ctx.GetNonEmptyStringArg("id"),
                    ctxSource: ctx.Source)
            );

            Field<BooleanGraphType>(
                name: "isTemplateDescendantOfAny",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<ListGraphType<NonNullGraphType<StringGraphType>>>>
                    {
                        Name = "baseTemplateIds",
                        Description = "Base Template Ids"
                    }),
                resolve: ctx => ResolveIsDescendantOfAny(
                    baseTemplateIds: ctx.GetArgument<Guid[]>("baseTemplateIds"),
                    ctxSource: ctx.Source)
            );

            Field<BooleanGraphType>(
            "isBranchTemplate",
                resolve: context => context.Source?.InnerItem.TemplateID == TemplateIDs.BranchTemplate
            );

            Field<ListGraphType<StringGraphType>>(
                "baseTemplateIds",
                resolve: context => GetBaseTemplateIds(context.Source)
            );
        }

        private static object ResolveTemplateField(string id, TemplateItem ctxSource)
        {
            if (!ID.TryParse(id, out ID fieldId))
            {
                throw new HorizonGqlError(GenericErrorCodes.InvalidArgument, "Valid guid expected");
            }

            return ctxSource.GetField(fieldId);
        }

        private object ResolveIsDescendantOfAny(Guid[] baseTemplateIds, TemplateItem ctxSource)
        {
            var templateId = ctxSource.ID;
            if (baseTemplateIds.Contains(templateId.Guid))
            {
                return true;
            }

            return GetBaseTemplateIds(ctxSource).Intersect(baseTemplateIds).Any();
        }

        private IEnumerable<Guid> GetBaseTemplateIds(TemplateItem ctxSource)
        {
            var template = _templateManager.GetTemplate(ctxSource.ID, ctxSource.Database);
            return template != null ? template.GetBaseTemplates().Select(x => x.ID.Guid) : Enumerable.Empty<Guid>();
        }
    }
}
