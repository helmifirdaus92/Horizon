// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.Data;
using Sitecore.Horizon.Integration.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ContentInterfaceGraphType : InterfaceGraphType
    {
        public ContentInterfaceGraphType(IHorizonItemHelper itemHelper,
            ItemGraphType itemGraphType,
            FolderGraphType folderGraphType,
            PageGraphType pageGraphType)
        {
            Name = "Content";

            Field<NonNullGraphType<StringGraphType>>("id");

            Field<NonNullGraphType<StringGraphType>>("name");

            Field<NonNullGraphType<StringGraphType>>("versionName");

            Field<NonNullGraphType<StringGraphType>>("displayName");

            Field<NonNullGraphType<StringGraphType>>("createdBy");

            Field<NonNullGraphType<StringGraphType>>("creationDate");

            Field<NonNullGraphType<StringGraphType>>("revision");

            Field<NonNullGraphType<StringGraphType>>("updatedBy");

            Field<NonNullGraphType<StringGraphType>>("updatedDate");

            Field<NonNullGraphType<TemplateGraphType>>("template");

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ContentInterfaceGraphType>>>>("children");

            Field<NonNullGraphType<BooleanGraphType>>("hasChildren");

            Field<NonNullGraphType<IntGraphType>>("version");

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ContentInterfaceGraphType>>>>("versions");

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ContentInterfaceGraphType>>>>(
                name: "versionsAll",
                arguments: new QueryArguments(new QueryArgument<BooleanGraphType>
                {
                    Name = "includeAllLanguages",
                    Description = "Controls whether versions from all the languages should be included. When disabled only versions from current language will be returned.",
                }));

            Field<NonNullGraphType<StringGraphType>>("icon");

            Field<NonNullGraphType<StringGraphType>>("path");

            Field<NonNullGraphType<StringGraphType>>("language");

            Field<ContentInterfaceGraphType>("parent");

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<ContentInterfaceGraphType>>>>("ancestors");

            Field<WorkflowStateGraphType>("workflow");

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<InsertOptionInterfaceGraphType>>>>(
                name: "insertOptions",
                arguments: new QueryArguments(new QueryArgument<NonNullGraphType<EnumerationGraphType<InsertOptionKind>>>
                {
                    Name = "kind",
                    Description = "Kind of insert options to return"
                }));

            Field<NonNullGraphType<ContentItemPermissionsGraphType>>("permissions");

            Field<NonNullGraphType<ContentItemLockingGraphType>>("locking");

            Field<NonNullGraphType<ContentItemPublishingGraphType>>("publishing");

            Field<BooleanGraphType>("isLatestPublishableVersion");

            ResolveType = value =>
            {
                if (itemHelper.HasPresentation((Item)value))
                {
                    return pageGraphType;
                }

                if (itemHelper.IsFolder((Item)value))
                {
                    return folderGraphType;
                }

                return itemGraphType;
            };
        }
    }
}
