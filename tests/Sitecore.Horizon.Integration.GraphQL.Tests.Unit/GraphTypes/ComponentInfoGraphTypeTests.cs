// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.AutoNSubstitute;
using AutoFixture.Xunit2;
using NSubstitute;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Web.UI;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ComponentInfoGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties([Frozen] IThemeHelper themeHelper,
            ComponentInfoGraphType sut,
            Item item,
            Item parentItem,
            [Substitute] ItemAppearance itemAppearance,
            string iconUrl)
        {
            // arrange
            item.Parent.Returns(parentItem);
            item.Appearance.Returns(itemAppearance);
            item[ComponentInfoGraphType.ComponentNameFieldId] = "cp1";
            themeHelper.MapTheme(itemAppearance.Icon, ImageDimension.id32x32).Returns(iconUrl);

            // act & assert
            sut.Should().ResolveFieldValueTo("id", item.ID, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("displayName", item.DisplayName, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("iconUrl", iconUrl, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("category", parentItem.DisplayName, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("categoryId", parentItem.ID, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("componentName", item[ComponentInfoGraphType.ComponentNameFieldId], c=> c.WithSource(item));
        }
    }
}
