// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using Microsoft.Practices.EnterpriseLibrary.Common.Utility;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.ContentSearch.Linq;
using Sitecore.ContentSearch.Linq.Helpers;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Media;
using Sitecore.Horizon.Integration.Search;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.AutoFixture;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Media
{
    public class MediaSearcherTests
    {
        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization), typeof(FallbackToAnyItemLanguageVersionCustomization))]
        internal void GetAllMediaItems_ShouldUseFirstSourceFromArgumentsWhenCreatingSearchContext([Frozen] IPlatformSearchRunner platformSearchRunner, MediaSearcher sut, Item source1, Item source2, Language lang, int limit)
        {
            // arrange
            // act
            sut.GetAllMediaItems(ToArray(source1, source2), null, lang, limit);

            // assert
            platformSearchRunner.Received().CreateSearchContext(source1);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization), typeof(FallbackToAnyItemLanguageVersionCustomization))]
        internal void GetAllMediaItems_ShouldReturnCorrectResultsScenario1([Frozen] IPlatformSearchRunner platformSearchRunner, [Frozen] BaseMediaManager mediaManager, MediaSearcher sut, Item[] sources, Language lang, IFixture fixture)
        {
            // arrange
            WhenPlatformSearchReturns(platformSearchRunner, mediaManager, fixture)
                .AddItems(5);

            // act
            var result = sut.GetAllMediaItems(sources, null, lang, 10);

            // assert
            result.HasMoreItems.Should().BeFalse();
            result.Items.Should().HaveCount(5);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization), typeof(FallbackToAnyItemLanguageVersionCustomization))]
        internal void GetAllMediaItems_ShouldReturnCorrectResultsScenario2([Frozen] IPlatformSearchRunner platformSearchRunner, [Frozen] BaseMediaManager mediaManager, MediaSearcher sut, Item[] sources, Language lang, IFixture fixture)
        {
            // arrange
            WhenPlatformSearchReturns(platformSearchRunner, mediaManager, fixture)
                .AddItems(10);

            // act
            var result = sut.GetAllMediaItems(sources, null, lang, 5);

            // assert
            result.HasMoreItems.Should().BeTrue();
            result.Items.Should().HaveCount(5);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization), typeof(FallbackToAnyItemLanguageVersionCustomization))]
        internal void GetAllMediaItems_ShouldReturnCorrectResultsScenario3([Frozen] IPlatformSearchRunner platformSearchRunner, [Frozen] BaseMediaManager mediaManager, MediaSearcher sut, Item[] sources, Language lang, IFixture fixture)
        {
            // arrange
            WhenPlatformSearchReturns(platformSearchRunner, mediaManager, fixture)
                .AddItems(3)
                .AddItems(3, platformSkip: true)
                .AddItems(4);

            // act
            var result = sut.GetAllMediaItems(sources, null, lang, 5);

            // assert
            result.HasMoreItems.Should().BeTrue();
            result.Items.Should().HaveCount(5);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization), typeof(FallbackToAnyItemLanguageVersionCustomization))]
        internal void GetAllMediaItems_ShouldReturnCorrectResultsScenario4([Frozen] IPlatformSearchRunner platformSearchRunner, [Frozen] BaseMediaManager mediaManager, MediaSearcher sut, Item[] sources, Language lang, IFixture fixture)
        {
            // arrange
            WhenPlatformSearchReturns(platformSearchRunner, mediaManager, fixture)
                .AddItems(1)
                .AddItems(2, platformSkip: true)
                .AddItems(2, hasStream: false)
                .AddItems(2)
                .AddItems(2, hasStream: false)
                .AddItems(20);

            // act
            var result = sut.GetAllMediaItems(sources, null, lang, 5);

            // assert
            result.HasMoreItems.Should().BeTrue();
            result.Items.Should().HaveCount(5);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization), typeof(FallbackToAnyItemLanguageVersionCustomization))]
        internal void GetAllMediaItems_ShouldReturnCorrectResultsScenario5([Frozen] IPlatformSearchRunner platformSearchRunner, [Frozen] BaseMediaManager mediaManager, MediaSearcher sut, Item[] sources, Language lang, IFixture fixture)
        {
            // arrange
            WhenPlatformSearchReturns(platformSearchRunner, mediaManager, fixture)
                .AddItems(3, hasStream: false)
                .AddItems(10)
                .AddItems(10, hasStream: false);

            // act
            var result = sut.GetAllMediaItems(sources, null, lang, 5);

            // assert
            result.HasMoreItems.Should().BeTrue();
            result.Items.Should().HaveCount(5);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization), typeof(FallbackToAnyItemLanguageVersionCustomization))]
        internal void GetAllMediaItems_ShouldReturnCorrectResultsScenario6([Frozen] IPlatformSearchRunner platformSearchRunner, [Frozen] BaseMediaManager mediaManager, MediaSearcher sut, Item[] sources, Language lang, IFixture fixture)
        {
            // arrange
            WhenPlatformSearchReturns(platformSearchRunner, mediaManager, fixture)
                .AddItems(5)
                .AddItems(2, platformSkip: true)
                .AddItems(3)
                .AddItems(2, platformSkip: true)
                .AddItems(1, hasStream: false)
                .AddItems(2);


            // act
            var result = sut.GetAllMediaItems(sources, null, lang, 10);

            // assert
            result.HasMoreItems.Should().BeFalse();
            result.Items.Should().HaveCount(10);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization), typeof(FallbackToAnyItemLanguageVersionCustomization))]
        internal void GetAllMediaItems_ShouldReturnCorrectResultsScenario7([Frozen] IPlatformSearchRunner platformSearchRunner, [Frozen] BaseMediaManager mediaManager, MediaSearcher sut, Item[] sources, Language lang, ID id, IFixture fixture)
        {
            // arrange
            WhenPlatformSearchReturns(platformSearchRunner, mediaManager, fixture)
                .AddItem(id, "en")
                .AddItem()
                .AddItem(id, "uk-UA")
                .AddItem()
                .AddItem(id, "dk")
                .AddItem()
                .AddItem(id, lang.Name)
                .AddItems(10);

            // act
            var result = sut.GetAllMediaItems(sources, null, lang, 5);

            // assert
            result.HasMoreItems.Should().BeTrue();
            result.Items.Should().HaveCount(5);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization))]
        internal void SearchMediaItems_ShouldMatchAllContentFields([Frozen] IPlatformSearchRunner searchRunner, MediaSearcher sut, string searchQuery, Item[] sources, Language lang)
        {
            // arrange
            IQueryable<HorizonMediaSearchModel> capturedQueryable = null;
            searchRunner.Execute(Arg.Do<IQueryable<HorizonMediaSearchModel>>(x => capturedQueryable = x));

            // act
            sut.SearchMediaItems(searchQuery, sources, null, lang, limit: 5);

            // assert
            var queryInfo = SearchQueryInspectionVisitor.InspectQuery(capturedQueryable.Expression);
            queryInfo.WildcardQueryProperties.Select(nv => nv.name).Should().BeEquivalentTo(
                nameof(HorizonMediaSearchModel.Name),
                nameof(HorizonMediaSearchModel.DisplayName),
                nameof(HorizonMediaSearchModel.Content),
                nameof(HorizonMediaSearchModel.Alt)
            );
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization))]
        internal void SearchMediaItems_ShouldTrimMultipleSpacesFromQuery([Frozen] IPlatformSearchRunner searchRunner, MediaSearcher sut, Item[] sources, Language lang, int limit)
        {
            // arrange
            IQueryable<HorizonMediaSearchModel> capturedQueryable = null;
            searchRunner.Execute(Arg.Do<IQueryable<HorizonMediaSearchModel>>(x => capturedQueryable = x));

            var searchQuery = "I       love  Horizon";

            // act
            sut.SearchMediaItems(searchQuery, sources, null, lang, limit);

            // assert
            var queryInfo = SearchQueryInspectionVisitor.InspectQuery(capturedQueryable.Expression);
            string transformedValue = queryInfo.WildcardQueryProperties.First().value;
            transformedValue.Replace("*", "").Should().Be("I love Horizon");
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization))]
        internal void SearchMediaItems_ShouldTrimLeadingAndTrailingSpaces([Frozen] IPlatformSearchRunner searchRunner, MediaSearcher sut, Item[] sources, Language lang, int limit)
        {
            // arrange
            IQueryable<HorizonMediaSearchModel> capturedQueryable = null;
            searchRunner.Execute(Arg.Do<IQueryable<HorizonMediaSearchModel>>(x => capturedQueryable = x));

            var searchQuery = " I love Horizon ";

            // act
            sut.SearchMediaItems(searchQuery, sources, null, lang, limit);

            // assert
            var queryInfo = SearchQueryInspectionVisitor.InspectQuery(capturedQueryable.Expression);
            string transformedValue = queryInfo.WildcardQueryProperties.First().value;
            transformedValue.Replace("*", "").Should().Be("I love Horizon");
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization))]
        internal void SearchMediaItems_EachQueryWordShouldBeWildcarded([Frozen] IPlatformSearchRunner searchRunner, MediaSearcher sut, Item[] sources, Language lang, int limit)
        {
            // arrange
            IQueryable<HorizonMediaSearchModel> capturedQueryable = null;
            searchRunner.Execute(Arg.Do<IQueryable<HorizonMediaSearchModel>>(x => capturedQueryable = x));

            var searchQuery = "I love Horizon";

            // act
            sut.SearchMediaItems(searchQuery, sources, null, lang, limit);

            // assert
            var queryInfo = SearchQueryInspectionVisitor.InspectQuery(capturedQueryable.Expression);
            string transformedValue = queryInfo.WildcardQueryProperties.First().value;
            transformedValue.Should().Be("I* love* Horizon*");
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(QueryableMockCustomization))]
        internal void SearchMediaItems_QuotedQueryShouldBeUsedAsIs([Frozen] IPlatformSearchRunner searchRunner, MediaSearcher sut, Item[] sources, Language lang, int limit)
        {
            // arrange
            IQueryable<HorizonMediaSearchModel> capturedQueryable = null;
            searchRunner.Execute(Arg.Do<IQueryable<HorizonMediaSearchModel>>(x => capturedQueryable = x));

            var searchQuery = "\"I love Horizon\"";

            // act
            sut.SearchMediaItems(searchQuery, sources, null, lang, limit);

            // assert
            var queryInfo = SearchQueryInspectionVisitor.InspectQuery(capturedQueryable.Expression);
            string transformedValue = queryInfo.WildcardQueryProperties.First().value;
            transformedValue.Should().Be("\"I love Horizon\"");
        }

        private static T[] ToArray<T>(params T[] elements) => elements;

        private static SearchResultBuilder WhenPlatformSearchReturns(IPlatformSearchRunner searchRunner, BaseMediaManager mediaManager, IFixture fixture)
        {
            var resultBuilder = new SearchResultBuilder(fixture);

            searchRunner.Execute(Any.Arg<IQueryable<HorizonMediaSearchModel>>()).Returns(c =>
            {
                var query = c.Arg<IQueryable<HorizonMediaSearchModel>>();
                var queryInfo = SearchQueryInspectionVisitor.InspectQuery(query.Expression);

                var results = resultBuilder.Results;

                var unfilteredResult = results.Skip(queryInfo.Skip).Take(queryInfo.Take).ToArray();
                var filteredResult = unfilteredResult.Where(x => !x.skip).ToArray();
                int totalCount = results.Count - (unfilteredResult.Length - filteredResult.Length);

                filteredResult.ForEach(res => mediaManager.HasMediaContent(Arg.Is<Item>(item => item.ID == res.doc.Uri.ItemID)).Returns(res.hasStream));

                return new SearchResults<HorizonMediaSearchModel>(
                    filteredResult.Select(res => new SearchHit<HorizonMediaSearchModel>(0, res.doc)).ToArray(),
                    totalCount);
            });

            return resultBuilder;
        }

        private class QueryableMockCustomization : ICustomization
        {
            public void Customize(IFixture fixture)
            {
                fixture.Register<IQueryable<HorizonMediaSearchModel>>(() => new EnumerableQuery<HorizonMediaSearchModel>(Enumerable.Empty<HorizonMediaSearchModel>()));
            }
        }

        private class FallbackToAnyItemLanguageVersionCustomization : ICustomization
        {
            public void Customize(IFixture fixture)
            {
                var db = fixture.Create<Database>();
                db.GetItem(Any.ID, Any.Language).Returns(c => db.GetItem(c.ArgAt<ID>(0)));
                db.GetItem(Any.ID, Any.Language, Any.Arg<Version>()).Returns(c => db.GetItem(c.ArgAt<ID>(0)));
            }
        }

        private class SearchQueryInspectionVisitor : ExpressionVisitor
        {
            public int Skip { get; set; }

            public int Take { get; set; }

            public List<(string name, string value)> WildcardQueryProperties { get; } = new List<(string name, string value)>();

            public static SearchQueryInspectionVisitor InspectQuery(Expression expression)
            {
                var visitor = new SearchQueryInspectionVisitor();
                visitor.Visit(expression);

                return visitor;
            }

            protected override Expression VisitMethodCall(MethodCallExpression node)
            {
                if (node.Method.Name == nameof(Enumerable.Skip))
                {
                    Skip = ReadConstant<int>(node.Arguments[1]);
                }

                if (node.Method.Name == nameof(Enumerable.Take))
                {
                    Take = ReadConstant<int>(node.Arguments[1]);
                }

                if (node.Method.Name == nameof(MethodExtensions.MatchWildcard))
                {
                    var propertyName = ((MemberExpression)node.Arguments[0]).Member.Name;

                    var desiredPropValueExp = (MemberExpression)node.Arguments[1];
                    var desiredPropValue = (string)desiredPropValueExp.Member.GetValue(ReadConstant<object>(desiredPropValueExp.Expression));

                    WildcardQueryProperties.Add((propertyName, desiredPropValue));
                }

                return base.VisitMethodCall(node);
            }

            private static T ReadConstant<T>(Expression expression)
            {
                return (T)((ConstantExpression)expression).Value;
            }
        }

        private class SearchResultBuilder
        {
            private readonly IFixture _fixture;

            public SearchResultBuilder(IFixture fixture)
            {
                _fixture = fixture;
                Results = new List<(HorizonMediaSearchModel doc, bool skip, bool hasStream)>();
            }

            public List<(HorizonMediaSearchModel doc, bool skip, bool hasStream)> Results { get; }

            public SearchResultBuilder AddItem(ID id = null, string lang = null, bool platformSkip = false, bool hasStream = true)
            {
                var db = _fixture.Create<Database>();
                var fakeItem = new FakeItem(id, db).WithUri();
                var model = _fixture.Create<HorizonMediaSearchModel>();

                model.Language = lang ?? model.Language;
                model.Uri = fakeItem.ToSitecoreItem().Uri;
                Results.Add((model, skip: platformSkip, hasStream));

                return this;
            }

            public SearchResultBuilder AddItems(int count, bool platformSkip = false, bool hasStream = true)
            {
                for (int i = 0; i < count; i++)
                {
                    AddItem(platformSkip: platformSkip, hasStream: hasStream);
                }

                return this;
            }
        }
    }
}
