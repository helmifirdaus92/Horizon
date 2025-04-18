// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Sitecore.Pipelines;

namespace Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains
{
    [SuppressMessage("Microsoft.Usage", "CA2237:MarkISerializableTypesWithSerializable", Justification = "Serialization is not required for this args.")]
    [SuppressMessage("Microsoft.Naming", "CA1710:IdentifiersShouldHaveCorrectSuffix", Justification = "'Arg' suffix it's enough for pipeline args.")]
    internal class CollectIFrameAllowedDomainsArgs : PipelineArgs
    {
        public ICollection<string> AllowedDomains { get; } = new List<string>();
    }
}
