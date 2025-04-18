// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Create
{
    internal class CreateFolderInput : BaseItemInput
    {
        public CreateFolderInput()
        {
            Name = "CreateFolderInput";

            Field<NonNullGraphType<StringGraphType>>("parentId");
            Field<NonNullGraphType<StringGraphType>>("folderName");
            Field<NonNullGraphType<StringGraphType>>("templateId");
        }

        public string ParentId { get; set; }
        public string FolderName { get; set; }
        public string TemplateId { get; set; }
    }
}
