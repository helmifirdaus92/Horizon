// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Threading.Tasks;
using System.Web.Http;
using GraphQL;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Services.Core;
using Sitecore.Services.Infrastructure.Web.Http;
using Sitecore.Services.Infrastructure.Web.Http.Filters;

namespace Sitecore.Horizon.Integration.GraphQL.Controllers
{
    [ServicesController("horizon/query"), SitecoreAuthorize, RequireApiHorizonMode]
    public class HorizonQueryController : ServicesApiController
    {
        private readonly IHorizonSchema _horizonSchema;

        internal HorizonQueryController(IHorizonSchema horizonSchema)
        {
            _horizonSchema = horizonSchema;
        }

        [HttpPost, ActionName("DefaultAction")]
        public async Task<IHttpActionResult> RunQuery([FromBody] GqlQuery? query)
        {
            if (query?.Query == null)
            {
                return BadRequest("Query is not specified");
            }

            var result = await _horizonSchema.RunQuery(query.OperationName, query.Query, query.Variables.ToInputs()).ConfigureAwait(false);
            return Json(result);
        }
    }
}
