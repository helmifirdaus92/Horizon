// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Globalization;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class LanguageGraphType : ObjectGraphType<Language>
    {
        public LanguageGraphType()
        {
            Name = "Language";
            Field<NonNullGraphType<StringGraphType>>(
                "name",
                resolve: ctx => ctx.Source.Name);

            Field<NonNullGraphType<StringGraphType>>(
                "displayName",
                resolve: ctx => ctx.Source.LanguageDisplayName);

            Field<NonNullGraphType<StringGraphType>>(
                "englishName",
                resolve: ctx => ctx.Source.LanguageEnglishName);

            Field<NonNullGraphType<StringGraphType>>(
                "nativeName",
                resolve: ctx => ctx.Source.LanguageNativeName);

            Field<NonNullGraphType<StringGraphType>>(
                "iso",
                resolve: ctx => ctx.Source.CultureInfo.TwoLetterISOLanguageName);
        }
    }
}
