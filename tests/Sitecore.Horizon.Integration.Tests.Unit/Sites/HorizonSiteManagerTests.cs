// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Sites;
using Sitecore.Web;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Sites
{
    public class HorizonSiteManagerTests
    {
        [Theory]
        [AutoNData]
        internal void GetSiteByName_ShouldReturnSiteIfNameSpecified(
            [Frozen] BaseSiteContextFactory contextFactoryWrapper,
            HorizonSiteManager sut
        )
        {
            // arrange
            contextFactoryWrapper.Configure().GetSiteContext("bar").Returns(new SiteContext(new SiteInfo(new StringDictionary
            {
                ["name"] = "bar",
                ["startPath"] = "/bar"
            })));

            // act
            var result = sut.GetSiteByName("bar");

            // assert
            result.Should().NotBeNull();
            result.Name.Should().Be("bar");
        }

        [Theory]
        [AutoNData]
        internal void TryBestMatchClientSiteByHost_ShouldReturnSiteIfHostSpecified(
            [Frozen] BaseSiteContextFactory contextFactory,
            [Frozen] ISitecoreContext context,
            HorizonSiteManager sut,
            Database database,
            Item item
        )
        {
            // arrange
            SiteInfo[] sites =
            {
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "foo",
                    ["startPath"] = "/foo",
                    ["hostName"] = "foo"
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "login",
                    ["startPath"] = "/login"
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "bar",
                    ["startPath"] = "/bar",
                    ["hostName"] = "bar"
                })
            };

            context.Database.Returns(database);
            database.GetItem(Any.String).Returns(item);

            contextFactory.Configure().GetSites().Returns(sites.ToList());

            // act
            var result = sut.TryBestMatchClientSiteByHost("bar");

            // assert
            result.Should().Be("bar");
        }

        [Theory, AutoNData]
        internal void TryBestMatchClientSiteByHost_ShouldIgnoreSitesWithoutHostName(
            [Frozen] BaseSiteContextFactory contextFactory,
            [Frozen] ISitecoreContext context,
            HorizonSiteManager sut,
            Database database,
            Item item)
        {
            // arrange
            SiteInfo[] sites =
            {
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "foo",
                    ["startPath"] = "/foo",
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "login",
                    ["startPath"] = "/login"
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "bar",
                    ["startPath"] = "/bar",
                    ["hostName"] = "bar"
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "website",
                    ["startPath"] = "/website",
                })
            };

            context.Database.Returns(database);
            database.GetItem(Any.String).Returns(item);

            contextFactory.Configure().GetSites().Returns(sites.ToList());

            // act
            var result = sut.TryBestMatchClientSiteByHost("bar");

            // assert
            result.Should().Be("bar");
        }

        [Theory, AutoNData]
        internal void TryBestMatchClientSiteByHost_ShouldReturnNothingIfNoMatchesAcrossSitesWithHostName(
            [Frozen] BaseSiteContextFactory contextFactory,
            HorizonSiteManager sut)
        {
            // arrange
            SiteInfo[] sites =
            {
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "foo",
                    ["startPath"] = "/foo",
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "login",
                    ["startPath"] = "/login"
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "bar",
                    ["startPath"] = "/bar",
                    ["hostName"] = "bar"
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "website",
                    ["startPath"] = "/website",
                })
            };

            contextFactory.Configure().GetSites().Returns(sites.ToList());

            // act
            var result = sut.TryBestMatchClientSiteByHost("zzz");

            // assert
            result.Should().BeNull();
        }

        [Theory]
        [AutoNData]
        internal void GetAllSites_ShouldReturnSitesIncludingSystem(
            [Frozen] BaseSiteContextFactory contextFactoryWrapper,
            HorizonSiteManager sut,
            Item item1,
            Item item2,
            Item item3)
        {
            // arrange
            var sites = new List<SiteInfo>
            {
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "foo",
                    ["rootPath"] = item1.Paths.FullPath
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "login",
                    ["rootPath"] = item2.Paths.FullPath
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "bar",
                    ["rootPath"] = item3.Paths.FullPath,
                })
            };
            contextFactoryWrapper.Configure().GetSites().Returns(sites);

            // act
            var result = sut.GetAllSites(includeSystemSites: true).ToArray();

            // assert
            result.Select(s => s.SiteInfo).Should().Equal(sites);
        }

        [Theory]
        [AutoNData]
        internal void GetAllSites_ShouldReturnSitesExcludingSystem(
            [Frozen] BaseSiteContextFactory contextFactoryWrapper,
            HorizonSiteManager sut,
            Item item1,
            Item item2,
            Item item3
        )
        {
            // arrange
            var sites = new List<SiteInfo>
            {
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "foo",
                    ["rootPath"] = item1.Paths.FullPath
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "login",
                    ["rootPath"] = item2.Paths.FullPath,
                    ["isInternal"] = "true"
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "bar",
                    ["rootPath"] = item3.Paths.FullPath,
                    ["isInternal"] = "false"
                })
            };

            contextFactoryWrapper.Configure().GetSites().Returns(sites);

            // act
            var result = sut.GetAllSites(includeSystemSites: false).ToArray();

            // assert
            result.Select(x => x.SiteInfo).Should().Equal(sites[0], sites[2]);
        }

        [Theory]
        [AutoNData]
        internal void GetAllSites_ShouldReturnSitesExcludingSitesWithNonExistingStartItem(
            [Frozen] BaseSiteContextFactory contextFactoryWrapper,
            HorizonSiteManager sut,
            Item item
        )
        {
            // arrange
            var sites = new List<SiteInfo>
            {
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "foo",
                    ["rootPath"] = "/",
                    ["startItem"] = "non-existing-item",
                }),
                new SiteInfo(new StringDictionary
                {
                    ["name"] = "bar",
                    ["rootPath"] = item.Paths.FullPath
                })
            };

            contextFactoryWrapper.Configure().GetSites().Returns(sites);

            // act
            var result = sut.GetAllSites(includeSystemSites: true).ToArray();

            // assert
            result.Should().HaveCount(1).And.Subject.Single().SiteInfo.Name.Should().Be("bar");
        }
    }
}
