// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Integration.Context
{
    [Obsolete("use HeadlessMode instead from Kernel directory")]
    public enum HorizonContextMode
    {
        /// <summary>
        /// Request is not recognized as running in Horizon context.
        /// </summary>
        None = 0,

        /// <summary>
        /// Request is executed in Horizon Editing mode.
        /// </summary>
        Editor = 1,

        /// <summary>
        /// Request is executed in Horizon Preview mode.
        /// </summary>
        Preview = 2,

        /// <summary>
        /// Request is executed in Horizon Api mode.
        /// </summary>
        Api = 3
    }

    /// <summary>
    /// Accessor to get Horizon specific information for the current request
    /// </summary>
    [Obsolete("use HeadlessContext instead from Kernel directory")]
    public interface IHorizonContext
    {
        /// <summary>
        ///  Returns information about Horizon mode in which the current request is being processed.
        /// </summary>
        HorizonContextMode HorizonMode { get; }
    }
}
