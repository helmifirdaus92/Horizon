// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Creates a new version if needed.
    /// </summary>
    internal class NewVersion : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">The arguments.</param>
        public void Process(ref HorizonSaveItemArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));
        }
    }
}
