// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Jobs;
using Sitecore.Publishing;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal enum PublishingState
    {
        NotFound = 0,
        Failed = 1,
        Running = 2,
        Completed = 3
    }

    internal class PublishingStatusGraphType : ObjectGraphType<PublishStatus>
    {
        public PublishingStatusGraphType()
        {
            Name = "PublishingStatus";

            Field<EnumerationGraphType<PublishingState>>(name: "stateCode", resolve: ctx =>
            {
                return ctx.Source switch
                {
                    {State: JobState.Initializing or JobState.Queued or JobState.Running} => PublishingState.Running,
                    {State: JobState.Finished} => PublishingState.Completed,
                    {State: JobState.AbortRequested or JobState.Aborted} or {Failed: true} => PublishingState.Failed,

                    _ => PublishingState.NotFound
                };
            });
            Field<IntGraphType>(name: "processedItemsCount", resolve: ctx => ctx.Source.Processed);
        }
    }
}
