// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Security;
using Sitecore.LayoutService.ItemRendering.Pipelines.GetLayoutServiceContextClientData;
using Sitecore.LayoutService.Services;

namespace Sitecore.Horizon.Integration.Pipelines.GetLayoutServiceContextClientData;

[UsedInConfiguration]
internal class AddHorizonClientData : IGetLayoutServiceContextClientDataProcessor
{
    private readonly ISitecoreContext _context;
    private readonly ICanvasMessageFactory _canvasMessageFactory;
    private readonly IHostVerificationTokenHelper _hostTokenVerificationProvider;
    private readonly IEditModeResolver _editModeResolver;

    public AddHorizonClientData(ISitecoreContext context, ICanvasMessageFactory canvasMessageFactory, IEditModeResolver editModeResolver, IHostVerificationTokenHelper tokenHelper)
    {
        _context = context;
        _canvasMessageFactory = canvasMessageFactory;
        _editModeResolver = editModeResolver;
        _hostTokenVerificationProvider = tokenHelper;
    }

    public void Process(GetLayoutServiceContextClientDataArgs args)
    {
        var editMode = _editModeResolver.ResolveEditMode(_context.HttpContext?.Request);
        if (editMode == EditMode.Chromes)
        {
            return;
        }

        args.ClientData.Add("hrz-canvas-state", _canvasMessageFactory.CreateState());
        args.ClientData.Add("hrz-canvas-verification-token", _hostTokenVerificationProvider.BuildHostVerificationToken());
    }
}
