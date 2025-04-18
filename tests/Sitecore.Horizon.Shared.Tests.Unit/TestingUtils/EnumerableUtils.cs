// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;

namespace Sitecore.Horizon.Shared.Tests.Unit.TestingUtils
{
    public static class EnumerableUtils
    {
        public static IEnumerable<T> MakeEnumerable<T>(T arg)
        {
            yield return arg;
        }

        public static IEnumerable<T> MakeEnumerable<T>(T arg1, T arg2)
        {
            yield return arg1;
            yield return arg2;
        }

        public static IEnumerable<T> MakeEnumerable<T>(T arg1, T arg2, T arg3)
        {
            yield return arg1;
            yield return arg2;
            yield return arg3;
        }

        public static IEnumerable<T> ToEnumerable<T>(this T arg)
        {
            yield return arg;
        }

        public static IReadOnlyCollection<T> ToReadOnlyCollection<T>(IEnumerable<T> enumerable)
        {
            return enumerable.ToList().AsReadOnly();
        }
    }
}
