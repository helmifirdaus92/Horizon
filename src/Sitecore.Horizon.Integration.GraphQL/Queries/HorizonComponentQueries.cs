// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Pipelines.GetComponents;

namespace Sitecore.Horizon.Integration.GraphQL.Queries
{
    internal class HorizonComponentQueries : ObjectGraphType
    {
        public static readonly ID FeaaSWrapperComponentId = new ID("{CAA0C742-F052-49FB-825B-A03494798DB7}");
        public static readonly ID BYOCWrapperComponentId = new ID("{DDC43BE7-D77A-4CE3-9282-03DD036EEC6D}");
        public static readonly ID FormWrapperComponentId = new ID("{62DD1639-9F28-4040-8738-C886480B2127}");
        private readonly ISitecoreContext _scContext;
        private readonly BaseCorePipelineManager _pipelineManager;
        private readonly IClientLanguageService _clientLanguageService;

        public HorizonComponentQueries(ISitecoreContext scContext, IClientLanguageService clientLanguageService, BaseCorePipelineManager pipelineManager)
        {
            _scContext = scContext;
            _clientLanguageService = clientLanguageService;
            _pipelineManager = pipelineManager;

            Name = "ComponentRoot";

            Field<ComponentsGraphType>(
                "components",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<StringGraphType>>
                    {
                        Name = "site",
                    }
                ),
                resolve: ctx => GetComponentList(
                    site: ctx.GetNonEmptyStringArg("site")
                ));
        }

        private ComponentsInfo GetComponentList(string site)
        {
            _scContext.SetQueryContext(site: site);

            _clientLanguageService.ApplyClientLanguage();

            var args = new GetComponentsArgs();
            _pipelineManager.Platform().GetComponents(args);

            IEnumerable<ComponentGroup> groups = args.Groups;

            var wrapperComponentIdsToRemove = new HashSet<ID>
            {
                FeaaSWrapperComponentId,
                BYOCWrapperComponentId,
                FormWrapperComponentId
            };

            foreach (ComponentGroup group in groups)
            {
                foreach (var componentId in wrapperComponentIdsToRemove)
                {
                    Item? component = group.Components.SingleOrDefault(c => c.ID == componentId);
                    if (component != null)
                    {
                        group.Components.Remove(component);
                    }
                }
            }

            return new ComponentsInfo(args.Ungrouped, groups);
        }
    }
}
