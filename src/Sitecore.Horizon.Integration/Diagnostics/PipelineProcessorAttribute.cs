// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics;

namespace Sitecore.Horizon.Integration.Diagnostics
{
    /// <summary>
    ///   Indicate that current class is a part of the pipeline.
    ///   It will never be highlighted as unused.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface)]
    [Conditional("DEBUG")]
    internal sealed class PipelineProcessorAttribute : Attribute
    {
    }
}
