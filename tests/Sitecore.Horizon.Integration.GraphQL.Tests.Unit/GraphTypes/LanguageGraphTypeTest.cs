// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Globalization;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class LanguageGraphTypeTest
    {
        [Theory, AutoNData]
        internal void ShouldMapSimpleProperties(LanguageGraphType sut, Language languageContext)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("name", languageContext.Name, c => c.WithSource(languageContext));
            sut.Should().ResolveFieldValueTo("displayName", languageContext.CultureInfo.DisplayName, c => c.WithSource(languageContext));
            sut.Should().ResolveFieldValueTo("nativeName", languageContext.LanguageNativeName, c => c.WithSource(languageContext));
            sut.Should().ResolveFieldValueTo("englishName", languageContext.LanguageEnglishName, c => c.WithSource(languageContext));
            sut.Should().ResolveFieldValueTo("iso", languageContext.CultureInfo.TwoLetterISOLanguageName, c => c.WithSource(languageContext));
        }
    }
}
