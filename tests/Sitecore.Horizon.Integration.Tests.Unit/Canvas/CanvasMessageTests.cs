// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Newtonsoft.Json;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Canvas
{
    public class CanvasMessageTests
    {
        [Theory]
        [AutoNData]
        internal void ShouldSerializeTypeAsString(CanvasMessage<int> sut)
        {
            // arrange

            // act
            string json = JsonConvert.SerializeObject(sut);

            // assert
            json.Should().Contain($"\"type\":\"{sut.Type:G}\"");
        }
    }
}
