// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Sitecore.Horizon.Integration.Context;

namespace Sitecore.Horizon.Integration.Web
{
#pragma warning disable CS0618
    internal class HorizonRequestState
    {
        private static readonly HorizonRequestState Empty = new HorizonRequestState();

        public HorizonRequestState(HorizonMode mode, string? horizonHost)
        {
            Mode = mode;
            HorizonHost = horizonHost;
        }

        private HorizonRequestState()
        {
        }

        public HorizonMode Mode { get; }

        public string? HorizonHost { get; }

        [SuppressMessage("Microsoft.Design", "CA1062:ValidateArgumentsOfPublicMethods", Justification = "Null-checking is presented.")]
        public static HorizonRequestState Parse(string? modeValue, string? horizonHost)
        {
            if (string.IsNullOrEmpty(modeValue))
            {
                return Empty;
            }

            HorizonMode mode = ParseMode(modeValue!);
            return mode != HorizonMode.Disabled ? new HorizonRequestState(mode, horizonHost) : Empty;
        }

        [SuppressMessage("Microsoft.Globalization", "CA1308:NormalizeStringsToUppercase", Justification = "Lower case is intended")]
        public string RawMode()
        {
            return Mode == HorizonMode.Disabled ? string.Empty : Mode.ToString().ToLowerInvariant();
        }

        private static HorizonMode ParseMode(string value)
        {
            switch (value)
            {
                case "api":
                    return HorizonMode.Api;
                case "editor":
                    return HorizonMode.Editor;
                case "preview":
                    return HorizonMode.Preview;
                default:
                    return HorizonMode.Disabled;
            }
        }
    }
#pragma warning restore CS0618
}
