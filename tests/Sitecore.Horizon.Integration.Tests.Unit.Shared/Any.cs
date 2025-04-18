// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using System.Xml;
using NSubstitute.Core;
using NSubstitute.Core.Arguments;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;

namespace Sitecore.Horizon.Tests.Unit.Shared
{
    // WARNING!!!!
    // Ensure to mark all the properties with DebuggerBrowsable attribute, otherwise debugger could evaluate it and create unwanted side effects.

    public static class Any
    {
        private static readonly MethodInfo MatchesPatternMethodInfo = typeof(Any).GetMethod(nameof(MatchesPattern), BindingFlags.Static | BindingFlags.NonPublic);
        private static readonly MethodInfo ContentEqualsMethodInfo = typeof(Any).GetMethod(nameof(ContentEqualsPattern), BindingFlags.Static | BindingFlags.NonPublic);

        public delegate void RefAction<T>(ref T value);

        public interface ICapturedValue<T>
        {
            T Value { get; }
        }

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static bool Bool => NSubstitute.Arg.Any<bool>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static Guid Guid => NSubstitute.Arg.Any<Guid>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static ID ID => NSubstitute.Arg.Any<ID>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static Item Item => NSubstitute.Arg.Any<Item>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static int Int => NSubstitute.Arg.Any<int>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static long Long => NSubstitute.Arg.Any<long>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static object Object => NSubstitute.Arg.Any<object>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static string String => NSubstitute.Arg.Any<string>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static uint UInt => NSubstitute.Arg.Any<uint>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static ulong ULong => NSubstitute.Arg.Any<ulong>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static XmlDocument XmlDocument => NSubstitute.Arg.Any<XmlDocument>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static Language Language => NSubstitute.Arg.Any<Language>();

        public static ref T Arg<T>()
        {
            return ref NSubstitute.Arg.Any<T>();
        }

        public static ref T ArgDo<T>(Action<T> useArgument)
        {
            return ref NSubstitute.Arg.Do<T>(useArgument);
        }

        public static ref T ArgDo<T>(RefAction<T> action) where T : struct
        {
            // Keep this helper until NSubstitute allows to enqueue callbacks
            var argSpec = new ArgumentSpecification(typeof(T), new AnyArgumentMatcher(typeof(T)), arg =>
            {
                ref T value = ref Unsafe.Unbox<T>(arg);
                action(ref value);
            });
            SubstitutionContext.Current.ThreadContext.EnqueueArgumentSpecification(argSpec);
            return ref new DefaultValueHolder<T>().Value;
        }

        public static IEnumerable<T> Enumerable<T>()
        {
            return NSubstitute.Arg.Any<IEnumerable<T>>();
        }

        public static List<T> List<T>()
        {
            return NSubstitute.Arg.Any<List<T>>();
        }

        /// <summary>
        ///     Asserts that actual string contains the specified string.
        /// </summary>
        public static string StringLike(string wildcardExpression)
        {
            //Generate expression tree manually to have nice exception message.
            ParameterExpression valueParam = Expression.Parameter(typeof(string), "value");
            Expression<Predicate<string>> expression = Expression.Lambda<Predicate<string>>(
                Expression.Call(
                    null,
                    MatchesPatternMethodInfo,
                    Expression.Constant(wildcardExpression, typeof(string)),
                    valueParam
                ), valueParam);

            return NSubstitute.Arg.Is(expression);
        }

        public static T[] ArrayWithContent<T>(params T[] items)
        {
            //Generate expression tree manually to have nice exception message.
            ParameterExpression valueParam = Expression.Parameter(typeof(T[]), "value");
            Expression<Predicate<T[]>> expression = Expression.Lambda<Predicate<T[]>>(
                Expression.Call(
                    null,
                    ContentEqualsMethodInfo,
                    Expression.Constant(items, typeof(T[])),
                    valueParam
                ), valueParam);

            return NSubstitute.Arg.Is(expression);
        }

        public static Language LanguageWithName(string name)
        {
            //Generate expression tree manually to have nice exception message.
            ParameterExpression valueParam = Expression.Parameter(typeof(Language), "value");
            Expression<Predicate<Language>> expression = Expression.Lambda<Predicate<Language>>(
                Expression.Equal(
                    Expression.Property(valueParam, "Name"),
                    Expression.Constant(name, typeof(string))
                ),
                valueParam);
            return NSubstitute.Arg.Is(expression);
        }

        /// <summary>
        /// Captures the latest received value for this argument.
        /// </summary>
        public static T Capture<T>(out ICapturedValue<T> value)
        {
            var cv = new CapturedValue<T>();
            value = cv;
            return NSubstitute.Arg.Do<T>(v => cv.Value = v);
        }

        private static bool MatchesPattern(string patten, string value)
        {
            string regexPattern = "^" + Regex.Escape(patten).Replace("\\*", ".*").Replace("\\?", ".") + "$";

            return Regex.IsMatch(RemoveNewLines(value), regexPattern, RegexOptions.IgnoreCase);
        }

        private static bool ContentEqualsPattern(object[] expected, object[] actual)
        {
            return expected.Length == actual.Length && expected.SequenceEqual(actual);
        }

        private static string RemoveNewLines(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }

            return value.Replace("\r", string.Empty).Replace("\n", string.Empty);
        }

        public class DefaultValueHolder<T>
        {
            public T Value;
        }

        private class CapturedValue<T> : ICapturedValue<T>
        {
            private T _value;
            private bool hasValue;

            public T Value
            {
                get => hasValue ? _value : throw new InvalidOperationException("Value was never assigned - the expected call never happened.");
                set
                {
                    _value = value;
                    hasValue = true;
                }
            }
        }
    }
}
