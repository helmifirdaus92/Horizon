// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace Sitecore.Horizon.Shared.Tests.Unit.TestingUtils
{
    // WARNING!!!!
    // Ensure to mark all the properties with DebuggerBrowsable attribute, otherwise debugger could evaluate it and create unwanted side effects.

    public class Any
    {
        public interface ICapturedValue<T>
        {
            T Value { get; }
        }

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static bool Bool => NSubstitute.Arg.Any<bool>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static Guid Guid => NSubstitute.Arg.Any<Guid>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static int Int => NSubstitute.Arg.Any<int>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static long Long => NSubstitute.Arg.Any<long>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static object Object => NSubstitute.Arg.Any<object>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static string String => NSubstitute.Arg.Any<string>();

        [DebuggerBrowsable(DebuggerBrowsableState.Never)]
        public static Uri Uri => NSubstitute.Arg.Any<Uri>();

        public static IEnumerable<T> Enumerable<T>() => NSubstitute.Arg.Any<IEnumerable<T>>();

        public static T Arg<T>() => NSubstitute.Arg.Any<T>();

        /// <summary>
        /// Captures the latest received value for this argument.
        /// </summary>
        public static ref T Capture<T>(out ICapturedValue<T> value)
        {
            var cv = new CapturedValue<T>();
            value = cv;
            return ref NSubstitute.Arg.Do<T>(v => cv.Value = v);
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
