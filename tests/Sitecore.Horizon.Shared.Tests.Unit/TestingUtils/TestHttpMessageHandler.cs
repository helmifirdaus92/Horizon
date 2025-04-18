// © 2018 Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Sitecore.Horizon.Shared.Tests.Unit.TestingUtils
{
    public class TestHttpMessageHandler<T> : HttpMessageHandler
    {
        public TestHttpMessageHandler(T response)
        {
            Response = response;
        }

        public HttpRequestMessage CapturedRequest { get; private set; }
        private HttpStatusCode ResponseStatusCode { get; set; } = HttpStatusCode.OK;

        public int NumberOfCalls { get; private set; }

        private object Response { get; set; }

        public void SetErrorResponse(object value, HttpStatusCode statusCode)
        {
            Response = value;
            ResponseStatusCode = statusCode;
        }

        public void SetResponse(object value)
        {
            Response = value;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            NumberOfCalls++;
            CapturedRequest = request;

            string content = Response as string ?? JsonConvert.SerializeObject(Response);
            var responseMessage = new HttpResponseMessage
            {
                Content = new StringContent(content),
                StatusCode = ResponseStatusCode
            };

            return Task.FromResult(responseMessage);
        }
    }
}
