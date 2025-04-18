// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Extensions;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Queries;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.NSubstituteUtils;
using Sitecore.Pipelines.GetComponents;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Queries
{
    public class HorizonComponentQueriesTests
    {
        [Theory, AutoNData]
        internal void ComponentList_ShouldReturnComponentsFromPipeline([Frozen] BaseCorePipelineManager pipelineManager, HorizonComponentQueries sut, IList<Item> components, IList<ComponentGroup> groups)
        {
            // arrange
            pipelineManager.Platform().GetComponents(Arg.Do<GetComponentsArgs>(x =>
            {
                x.Groups.AddRange(groups);
                x.Ungrouped.AddRange(components);
            }));

            var componentInfo = new ComponentsInfo(components, groups);

            // act
            var result = sut.ResolveFieldValue<ComponentsInfo>(
                "components",
                c => c
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Groups.Should().BeEquivalentTo(groups);
            result.Ungrouped.Should().BeEquivalentTo(components);
        }

        [Theory, AutoNData]
        internal void ComponentList_ShouldRemoveFEaaSComponentFromPipelineResult([Frozen] BaseCorePipelineManager pipelineManager, HorizonComponentQueries sut, IList<Item> components, IList<ComponentGroup> groups)
        {
            // arrange
            ComponentGroup fEaaSWrapperGroup = new ComponentGroup()
            {
                Name = "FEaaS Wrapper Group",
                Components =
                {
                    new FakeItem(HorizonComponentQueries.FeaaSWrapperComponentId)
                }
            };
            groups.Add(fEaaSWrapperGroup);

            pipelineManager.Platform().GetComponents(Arg.Do<GetComponentsArgs>(x =>
            {
                x.Groups.AddRange(groups);
                x.Ungrouped.AddRange(components);
            }));

            // act
            var result = sut.ResolveFieldValue<ComponentsInfo>(
                "components",
                c => c
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Groups.Should().NotContain(s => s.Components.Any(c => c.ID == HorizonComponentQueries.FeaaSWrapperComponentId));
        }

        [Theory, AutoNData]
        internal void ComponentList_ShouldRemoveBYOCComponentFromPipelineResult([Frozen] BaseCorePipelineManager pipelineManager, HorizonComponentQueries sut, IList<Item> components, IList<ComponentGroup> groups)
        {
            // arrange
            ComponentGroup byocWrapperGroup = new ComponentGroup()
            {
                Name = "BYOC Wrapper Group",
                Components =
                {
                    new FakeItem(HorizonComponentQueries.BYOCWrapperComponentId)
                }
            };
            groups.Add(byocWrapperGroup);

            pipelineManager.Platform().GetComponents(Arg.Do<GetComponentsArgs>(x =>
            {
                x.Groups.AddRange(groups);
                x.Ungrouped.AddRange(components);
            }));

            // act
            var result = sut.ResolveFieldValue<ComponentsInfo>(
                "components",
                c => c
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Groups.Should().NotContain(s => s.Components.Any(c => c.ID == HorizonComponentQueries.BYOCWrapperComponentId));
        }

        [Theory, AutoNData]
        internal void ComponentList_ShouldRemoveFormWrapperComponentIdFromPipelineResult([Frozen] BaseCorePipelineManager pipelineManager, HorizonComponentQueries sut, IList<Item> components, IList<ComponentGroup> groups)
        {
            // arrange
            ComponentGroup byocWrapperGroup = new ComponentGroup()
            {
                Name = "BYOC Wrapper Group",
                Components =
                {
                    new FakeItem(HorizonComponentQueries.FormWrapperComponentId)
                }
            };
            groups.Add(byocWrapperGroup);

            pipelineManager.Platform().GetComponents(Arg.Do<GetComponentsArgs>(x =>
            {
                x.Groups.AddRange(groups);
                x.Ungrouped.AddRange(components);
            }));

            // act
            var result = sut.ResolveFieldValue<ComponentsInfo>(
                "components",
                c => c
                    .WithLangAndSiteArgs()
            );

            // assert
            result.Groups.Should().NotContain(s => s.Components.Any(c => c.ID == HorizonComponentQueries.FormWrapperComponentId));
        }

        [Theory, AutoNData]
        internal void ComponentList_ShouldSetContext([Frozen] ISitecoreContext scContext, HorizonComponentQueries sut)
        {
            // act
            var result = sut.ResolveFieldValue<ComponentsInfo>(
                "components",
                c => c
                    .WithArg("site", "testSite")
            );

            // assert
            scContext.Received().SetActiveSite("testSite");
        }

        [Theory, AutoNData]
        internal void ComponentList_ShouldApplyClientLanguage([Frozen] IClientLanguageService clientLanguageService, HorizonComponentQueries sut)
        {
            // act
            var result = sut.ResolveFieldValue<ComponentsInfo>(
                "components",
                c => c
                    .WithArg("site", "testSite")
            );

            // assert
            clientLanguageService.Received().ApplyClientLanguage();
        }
    }
}
