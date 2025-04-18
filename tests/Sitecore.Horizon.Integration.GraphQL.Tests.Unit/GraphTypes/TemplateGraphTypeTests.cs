// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using AutoFixture.AutoNSubstitute;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Engines;
using Sitecore.Data.Items;
using Sitecore.Data.Templates;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class TemplateGraphTypeTests
    {
        [Fact]
        internal void ShouldThrowException_WhenBaseTemplateManagerIsNull()
        {
            // act & assert
            Invoking.Action(() => new TemplateGraphType(null)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(TemplateGraphType sut, TemplateItem template)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("id", template.ID, c => c.WithSource(template));
            sut.Should().ResolveFieldValueTo("name", template.Name, c => c.WithSource(template));
            sut.Should().ResolveFieldValueTo("displayName", template.DisplayName, c => c.WithSource(template));
            sut.Should().ResolveFieldValueTo("path", template.InnerItem.Paths.FullPath, c => c.WithSource(template));
        }

        [Theory, AutoNData]
        internal void ResolveTemplateField_ShouldResolveFieldTemplateField(TemplateGraphType sut, [Substitute] TemplateItem template, TemplateFieldItem fieldItem, ID fieldId)
        {
            // arrange
            template.Configure().GetField(fieldId).Returns(fieldItem);

            // act & assert
            sut.Should().ResolveFieldValueTo("field", fieldItem, c => c.WithSource(template).WithArgs(("id", fieldId.ToString())));
        }

        [Theory, AutoNData]
        internal void ResolveTemplateField_ShouldThrowException_WhenProvidedIdIsNotValid(TemplateGraphType sut, TemplateItem template)
        {
            // act & assert
            sut.Invoking(s => s.ResolveFieldValue<object>("field",
                c => c.WithSource(template).WithArgs(("id", "NotValidId")))).Should().Throw<HorizonGqlError>().WithErrorCode(GenericErrorCodes.InvalidArgument);
        }

        [Theory, AutoNData]
        internal void ResolveIsDescendantOfAny_ShouldResolveIsTemplateDescendantOfAnyFieldToFalse(TemplateGraphType sut, TemplateItem template, Guid[] ids)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("isTemplateDescendantOfAny", false, c => c.WithSource(template).WithArgs(("baseTemplateIds", ids)));
        }

        [Theory, AutoNData]
        internal void ResolveIsDescendantOfAny_ShouldResolveIsTemplateDescendantOfAnyToTrue_WhenTemplateIsInProvidedArguments(TemplateGraphType sut, TemplateItem template, List<Guid> ids)
        {
            // arrange
            ids.Add(template.ID.Guid);

            // act & assert
            sut.Should().ResolveFieldValueTo("isTemplateDescendantOfAny", true, c => c.WithSource(template).WithArgs(("baseTemplateIds", ids)));
        }

        [Theory, AutoNData]
        internal void ResolveIsDescendantOfAny_ShouldResolveIsTemplateDescendantOfAnyToTrue_WhenTemplateIsDescendantOfAnyOfProvidedArguments(
            [Frozen] BaseTemplateManager templateManager,
            TemplateGraphType sut,
            [Frozen] TemplateEngine templateEngine,
            TemplateItem templateItem,
            ID baseTemplateIdA,
            ID baseTemplateIdB)
        {
            // arrange
            templateEngine.GetTemplate(Any.ID).Returns(c => new Template.Builder("baseTemplate", c.Arg<ID>(), templateEngine).Template);

            var templateBuilder = new Template.Builder(templateItem.Name, templateItem.ID, templateEngine);
            templateBuilder.SetBaseIDs(ID.ArrayToString(new[]
            {
                baseTemplateIdA,
                baseTemplateIdB
            }));

            templateManager.GetTemplate(templateItem.ID, templateItem.Database).Returns(templateBuilder.Template);

            // act & assert
            sut.Should().ResolveFieldValueTo("isTemplateDescendantOfAny", true, c => c.WithSource(templateItem).WithArgs(("baseTemplateIds", new Guid[]
            {
                baseTemplateIdA.Guid
            })));
        }

        [Theory, AutoNData]
        internal void ResolveBaseTemplateIds_ShouldResolveTemplateBaseTemplateIds(
            [Frozen] BaseTemplateManager templateManager,
            TemplateGraphType sut,
            [Frozen] TemplateEngine templateEngine,
            TemplateItem templateItem,
            ID baseTemplateIdA,
            ID baseTemplateIdB)
        {
            // arrange
            templateEngine.GetTemplate(Any.ID).Returns(c => new Template.Builder("baseTemplate", c.Arg<ID>(), templateEngine).Template);

            var templateBuilder = new Template.Builder(templateItem.Name, templateItem.ID, templateEngine);
            templateBuilder.SetBaseIDs(ID.ArrayToString(new[]
            {
                baseTemplateIdA,
                baseTemplateIdB
            }));

            templateManager.GetTemplate(templateItem.ID, templateItem.Database).Returns(templateBuilder.Template);

            // act & assert

            sut.Should().ResolveListFieldValueTo("baseTemplateIds", new[]
            {
                baseTemplateIdA.Guid,
                baseTemplateIdB.Guid
            }, c => c.WithSource(templateItem));
        }
    }
}
