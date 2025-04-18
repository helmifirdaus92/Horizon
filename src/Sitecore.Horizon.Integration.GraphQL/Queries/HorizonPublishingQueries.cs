// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Jobs;
using Sitecore.Publishing;

namespace Sitecore.Horizon.Integration.GraphQL.Queries
{
    internal class HorizonPublishingQueries : ObjectGraphType
    {
        private readonly BasePublishManager _publishManager;

        public HorizonPublishingQueries(BasePublishManager publishManager)
        {
            _publishManager = publishManager;

            // Is not being actually used.
            Name = nameof(HorizonPublishingQueries);

            Field<NonNullGraphType<PublishingStatusGraphType>>(
                name: "publishingStatus",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "handle",
                        Description = "Publishing handle"
                    }
                ),
                resolve: ctx => GetPublishingStatus(ctx.GetNonEmptyStringArg("handle")));
        }

        private PublishStatus GetPublishingStatus(string handleStr)
        {
            var handle = Handle.Parse(handleStr);
            if (Handle.Null.Equals(handle))
            {
                throw new HorizonGqlError(GenericErrorCodes.InvalidArgument, "Wrong handle");
            }

            PublishStatus pStatus = _publishManager.GetStatus(handle);
            if (pStatus == null)
            {
                var unknownStatus = new PublishStatus();
                unknownStatus.SetState(JobState.Unknown);
                return unknownStatus;
            }

            return pStatus;
        }
    }
}
