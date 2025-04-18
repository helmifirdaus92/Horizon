// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items.Saving;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class PresentationDetailsGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(PresentationDetailsGraphType sut, PresentationDetailsInfo presentationDetailsInfo)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("kind", presentationDetailsInfo.Kind, c => c.WithSource(presentationDetailsInfo));
            sut.Should().ResolveFieldValueTo("body", presentationDetailsInfo.Body, c => c.WithSource(presentationDetailsInfo));
        }
    }
}
