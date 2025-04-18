// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Create
{
    internal class CreatePageInput : BaseItemInput
    {
        public CreatePageInput()
        {
            Name = "CreatePageInput";

            Field<NonNullGraphType<StringGraphType>>("parentId");
            Field<NonNullGraphType<StringGraphType>>("pageName");
            Field<NonNullGraphType<StringGraphType>>("templateId");
        }

        public string ParentId { get; set; }
        public string PageName { get; set; }
        public string TemplateId { get; set; }
    }
}
