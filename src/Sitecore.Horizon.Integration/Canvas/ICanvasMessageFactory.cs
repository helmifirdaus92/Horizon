// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Presentation.Models;

namespace Sitecore.Horizon.Integration.Canvas
{
    internal interface ICanvasMessageFactory
    {
        CanvasMessage<CanvasState> CreateStateMessage();

        CanvasState CreateState();

        CanvasMessage<PresentationDetails> CreatePresentationDetailsMessage(PresentationDetails presentationDetail);

        CanvasMessage<HostVerificationModel> CreateHostVerificationTokenMessage(HostVerificationModel hostVerification);
    }
}
