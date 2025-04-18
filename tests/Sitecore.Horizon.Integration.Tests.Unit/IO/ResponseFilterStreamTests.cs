// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.IO;
using System.Linq;
using System.Text;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Horizon.Integration.IO;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.IO
{
    public class ResponseFilterStreamTests
    {
        [Theory]
        [AutoNData]
        internal void CanRead_ShouldDelegateToStream([Frozen] Stream stream, [NoAutoProperties] ResponseFilterStream sut)
        {
            // arrange

            // act
            bool result = sut.CanRead;

            // assert
            bool _ = stream.Received().CanRead;
        }

        [Theory]
        [AutoNData]
        internal void CanSeek_ShouldDelegateToStream([Frozen] Stream stream, [NoAutoProperties] ResponseFilterStream sut)
        {
            // arrange

            // act
            bool result = sut.CanSeek;

            // assert
            bool _ = stream.Received().CanSeek;
        }

        [Theory]
        [AutoNData]
        internal void CanWrite_ShouldDelegateToStream([Frozen] Stream stream, [NoAutoProperties] ResponseFilterStream sut)
        {
            // arrange

            // act
            bool result = sut.CanWrite;

            // assert
            bool _ = stream.Received().CanWrite;
        }

        [Theory]
        [AutoNData]
        internal void Length_ShouldDelegateToStream([Frozen] Stream stream, [NoAutoProperties] ResponseFilterStream sut)
        {
            // arrange

            // act
            long result = sut.Length;

            // assert
            long _ = stream.Received().Length;
        }

        [Theory]
        [AutoNData]
        internal void Seek_ShouldDelegateToStream(
            [Frozen] Stream stream,
            [NoAutoProperties] ResponseFilterStream sut,
            long offset,
            SeekOrigin origin)
        {
            // arrange

            // act
            long result = sut.Seek(offset, origin);

            // assert
            long _ = stream.Received().Seek(offset, origin);
        }

        [Theory]
        [AutoNData]
        internal void SetLength_ShouldDelegateToStream(
            [Frozen] Stream stream,
            [NoAutoProperties] ResponseFilterStream sut,
            long value)
        {
            // arrange

            // act
            sut.SetLength(value);

            // assert
            stream.Received().SetLength(value);
        }

        [Theory]
        [AutoNData]
        internal void Read_ShouldDelegateToStream(
            [Frozen] Stream stream,
            [NoAutoProperties] ResponseFilterStream sut,
            byte[] buffer,
            int offset,
            int count)
        {
            // arrange

            // act
            int result = sut.Read(buffer, offset, count);

            // assert
            int _ = stream.Received().Read(buffer, offset, count);
        }

        [Theory]
        [AutoNData]
        internal void Write_ShouldPostponeWriteToStream(
            [Frozen] Stream stream,
            [NoAutoProperties] ResponseFilterStream sut,
            byte[] buffer)
        {
            // arrange

            // act
            sut.Write(buffer, 0, buffer.Length);

            // assert
            stream.DidNotReceiveWithAnyArgs().Write(buffer, 0, buffer.Length);
        }

        [Theory]
        [AutoNData]
        internal void Flush_ShouldWritePostponedData(
            [Frozen] Stream stream,
            [NoAutoProperties] ResponseFilterStream sut,
            byte[] buffer)
        {
            // arrange
            sut.Write(buffer, 0, buffer.Length);

            // act
            sut.Flush();

            // assert
            stream.Received().Write(Arg.Is<byte[]>(x => x.SequenceEqual(buffer)), 0, buffer.Length);
        }

        [Theory]
        [AutoNData]
        internal void Flush_ShouldAddBodyContentWhenPassed(Stream stream, string content)
        {
            // arrange
            byte[] bytes = Encoding.UTF8.GetBytes("<body></body>");

            var sut = new ResponseFilterStream(stream, Encoding.UTF8)
            {
                BodyContent = content
            };

            byte[] resultBytes = null;
            stream.Write(Arg.Do<byte[]>(x => resultBytes = x), Any.Int, Any.Int);

            // act
            sut.Write(bytes, 0, bytes.Length);
            sut.Flush();

            // assert
            resultBytes.Should().NotBeNull();
            Encoding.UTF8.GetString(resultBytes).Should().Be("<body>" + content + "</body>");
        }

        [Theory]
        [AutoNData]
        internal void Flush_SetPositionToZero([NoAutoProperties] ResponseFilterStream sut, long position)
        {
            // arrange
            sut.Position = position;

            // act
            sut.Flush();

            // assert
            sut.Position.Should().Be(0);
        }
    }
}
