// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Templates;
using Sitecore.Horizon.Integration.Media;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Media
{
    public class MediaTemplateDiscovererTests
    {
        [Theory, AutoNData]
        internal void ShouldReturnAllTheVersionedMediaDescendantTemplates([Frozen] BaseTemplateManager templateManager, MediaTemplateDiscoverer sut, TemplateCollection templateCollection, ID id1, ID id2, Database db)
        {
            // arrange
            var versionedImageTemplate = BuildTemplate(TemplateIDs.VersionedImage, "VersionedImage", templateCollection);
            var descendant1 = BuildTemplate(id1, "Descendant1", templateCollection, baseId: versionedImageTemplate.ID);
            var descendant2 = BuildTemplate(id2, "Descendant2", templateCollection, baseId: descendant1.ID);

            templateManager.Configure().GetTemplate(TemplateIDs.VersionedImage, db).Returns(versionedImageTemplate);

            // act
            IEnumerable<ID> result = sut.GetVersionedMediaTemplates(db);

            // assert
            result.Should().BeEquivalentTo(TemplateIDs.VersionedImage, id1, id2);
        }

        [Theory, AutoNData]
        internal void ShouldReturnAllTheUnversionedMediaDescendantTemplates([Frozen] BaseTemplateManager templateManager, MediaTemplateDiscoverer sut, TemplateCollection templateCollection, ID id1, ID id2, Database db)
        {
            // arrange
            var unversionedImageTemplate = BuildTemplate(TemplateIDs.UnversionedImage, "UnversionedImage", templateCollection);
            var descendant1 = BuildTemplate(id1, "Descendant1", templateCollection, baseId: unversionedImageTemplate.ID);
            var descendant2 = BuildTemplate(id2, "Descendant2", templateCollection, baseId: descendant1.ID);

            templateManager.Configure().GetTemplate(TemplateIDs.UnversionedImage, db).Returns(unversionedImageTemplate);

            // act
            IEnumerable<ID> result = sut.GetUnversionedMediaTemplates(db);

            // assert
            result.Should().BeEquivalentTo(TemplateIDs.UnversionedImage, id1, id2);
        }

        [Theory, AutoNData]
        internal void ShouldFailIfVersionedImageTemplateNotFound([Frozen] BaseTemplateManager templateManager, MediaTemplateDiscoverer sut, Database db)
        {
            // arrange
            templateManager.Configure().GetTemplate(Any.ID, Any.Arg<Database>()).ReturnsNull();

            // act & assert
            sut.Invoking(s => s.GetVersionedMediaTemplates(db)).Should().Throw<InvalidOperationException>()
                .Which.Message.Should().Match("* versioned image template*");
        }

        [Theory, AutoNData]
        internal void ShouldFailIfUnversionedImageTemplateNotFound([Frozen] BaseTemplateManager templateManager, MediaTemplateDiscoverer sut, Database db)
        {
            // arrange
            templateManager.Configure().GetTemplate(Any.ID, Any.Arg<Database>()).ReturnsNull();

            // act & assert
            sut.Invoking(s => s.GetUnversionedMediaTemplates(db)).Should().Throw<InvalidOperationException>()
                .Which.Message.Should().Match("* unversioned image template*");
        }

        private static Template BuildTemplate(ID id, string name, TemplateCollection templateCollection, ID baseId = null)
        {
            var templateBuilder = new Template.Builder(name, id, templateCollection);

            if (!(baseId is null))
            {
                templateBuilder.SetBaseIDs(baseId.ToString());
            }

            Template template = templateBuilder.Template;

            templateCollection.Add(template);

            return template;
        }
    }
}
