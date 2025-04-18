// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Globalization;
using GraphQL.Language.AST;
using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations
{
    class StringWithPossibleDateTimeFormatGraphType : StringGraphType
    {
        public StringWithPossibleDateTimeFormatGraphType()
        {
            Name = nameof(StringWithPossibleDateTimeFormatGraphType);
        }

        public override object ParseLiteral(IValue value)
        {
            if (value is DateTimeValue)
            {
                return ((DateTime)value.Value).ToString("O", new CultureInfo(Constants.DefaultCulture).DateTimeFormat); // "O" = ISO 8601
            }

            return base.ParseLiteral(value);
        }
    }
}
