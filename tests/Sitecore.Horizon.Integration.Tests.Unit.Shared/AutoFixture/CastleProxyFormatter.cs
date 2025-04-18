// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions.Formatting;
using NSubstitute.Core;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture
{
    public class CastleProxyFormatter : IValueFormatter
    {
        public bool CanHandle(object value)
        {
            return value is ICallRouter;
        }

        public string Format(object value, FormattingContext context, FormatChild formatChild)
        {
            string typeName = value.GetType().FullName;

            return $"{{{typeName}:{value.GetHashCode()}}}";
        }
    }
}
