// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.IO
{
    internal class ResponseFilterStream : Stream
    {
        private static readonly Regex TransformWriteRegex = new Regex(@"(<BODY\b[^>]*?>)", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled);
        private readonly Stream _stream;
        private readonly Encoding _encoding;
        private readonly MemoryStream _cacheStream = new MemoryStream(4096);

        public ResponseFilterStream(Stream stream, Encoding encoding)
        {
            Assert.ArgumentNotNull(stream, nameof(stream));
            Assert.ArgumentNotNull(encoding, nameof(encoding));

            _stream = stream;
            _encoding = encoding;
        }

        public string? BodyContent { get; set; }

        public override bool CanRead => _stream.CanRead;

        public override bool CanSeek => _stream.CanSeek;

        public override bool CanWrite => _stream.CanWrite;

        public override long Length => _stream.Length;

        public override long Position { get; set; }

        public override void Flush()
        {
            byte[] cachedData = _cacheStream.ToArray();
            byte[] transformedData = TransformWrite(cachedData);

            _stream.Write(transformedData, 0, transformedData.Length);
            _stream.Flush();

            _cacheStream.SetLength(0);

            Position = 0;
        }

        public override long Seek(long offset, SeekOrigin origin) => _stream.Seek(offset, origin);

        public override void SetLength(long value) => _stream.SetLength(value);

        public override int Read(byte[] buffer, int offset, int count) => _stream.Read(buffer, offset, count);

        public override void Write(byte[] buffer, int offset, int count)
        {
            Assert.ArgumentNotNull(buffer, nameof(buffer));

            _cacheStream.Write(buffer, offset, count);
        }

        protected virtual byte[] TransformWrite(byte[] data)
        {
            Assert.ArgumentNotNull(data, nameof(data));

            if (string.IsNullOrEmpty(BodyContent))
            {
                return data;
            }

            string dataString = _encoding.GetString(data);

            dataString = TransformWriteRegex.Replace(dataString, "$1" + BodyContent, 1);

            return _encoding.GetBytes(dataString);
        }
    }
}
