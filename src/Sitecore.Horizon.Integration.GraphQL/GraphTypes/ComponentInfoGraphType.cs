// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using GraphQL.Types;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Web;
using Sitecore.Web.UI;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes;

internal class ComponentInfoGraphType : ObjectGraphType<Item>
{
    public static readonly ID ComponentNameFieldId = new("{037FE404-DD19-4BF7-8E30-4DADF68B27B0}");
    public static readonly ID OtherProperties = new("{E829C217-5E94-4306-9C48-2634B094FDC2}");

    private readonly IThemeHelper _themeHelper;

    public ComponentInfoGraphType(IThemeHelper themeHelper)
    {
        _themeHelper = themeHelper;

        Name = "ComponentInfo";

        Field<NonNullGraphType<StringGraphType>>(
            "id",
            resolve: ctx => ctx.Source.ID);

        Field<NonNullGraphType<StringGraphType>>(
            "displayName",
            resolve: ctx => ctx.Source.DisplayName);

        Field<NonNullGraphType<StringGraphType>>(
            "iconUrl",
            resolve: ctx => _themeHelper.MapTheme(ctx.Source.Appearance.Icon, ImageDimension.id32x32));

        Field<NonNullGraphType<StringGraphType>>(
            "category",
            resolve: ctx => ctx.Source.Parent.DisplayName);

        Field<StringGraphType>("componentName",
            resolve: ctx => ctx.Source[ComponentNameFieldId]);

        Field<NonNullGraphType<StringGraphType>>(
            "categoryId",
            resolve: ctx => ctx.Source.Parent.ID);

        Field<ListGraphType<ExtendedPropertiesGraphType>>("extendedProperties",
            resolve: ctx => GetCustomProperties(ctx.Source));
    }

    private Dictionary<string, string> GetCustomProperties(Item item)
    {
        NameValueCollection? parameters = WebUtil.ParseUrlParameters(item.Fields[OtherProperties]?.Value);
        return parameters.AllKeys.ToDictionary(k => k, k => parameters[k]);
    }
}
