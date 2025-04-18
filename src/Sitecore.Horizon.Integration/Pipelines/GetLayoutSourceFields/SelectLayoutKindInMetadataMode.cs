// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Web;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items.Saving;
using Sitecore.LayoutService.Services;
using Sitecore.Pipelines.GetLayoutSourceFields;

namespace Sitecore.Horizon.Integration.Pipelines.GetLayoutSourceFields
{
    /// <summary>
    /// Enables selection of a layout kind for metadata rendering mode.
    /// Selection happens by filtering out a final layout field source if LayoutKind.Shared is selected.
    /// Processor copies behavior of Experience editor processor for setting layout.
    /// <see cref="Sitecore.ExperienceEditor.Speak.Ribbon.Pipelines.GetLayoutSourceFields.SetLayoutRenderings"/>
    /// </summary>
    [UsedInConfiguration]
    internal class SelectLayoutKindInMetadataMode
    {
        private const string LayoutKindParamName = "sc_layoutKind";

        private readonly ISitecoreContext _context;
        private readonly IEditModeResolver _editModeResolver;

        public SelectLayoutKindInMetadataMode(ISitecoreContext context, IEditModeResolver editModeResolver)
        {
            _context = context;
            _editModeResolver = editModeResolver;
        }

        public virtual void Process(GetLayoutSourceFieldsArgs args)
        {
            var request = _context.HttpContext?.Request;
            if (request == null)
            {
                return;
            }

            var editMode = _editModeResolver.ResolveEditMode(request);
            if (editMode != EditMode.Metadata)
            {
                return;
            }

            var layoutKind = GetLayoutKind(request);
            if (layoutKind == LayoutKind.Final)
            {
                return;
            }

            Assert.ArgumentNotNull(args, nameof(args));

            ClearFields(args.FieldValuesSource, FieldIDs.FinalLayoutField);
            if (args.FieldOwnerIsStandardValuesHolder)
            {
                ClearFields(args.StandardValuesSource, FieldIDs.FinalLayoutField);
            }
        }

        private static void ClearFields(List<Field> fields, ID fieldIdToExclude)
        {
            Assert.ArgumentNotNull(fields, nameof(fields));
            Assert.ArgumentNotNull(fieldIdToExclude, nameof(fieldIdToExclude));

            fields.RemoveAll(s => s.ID == fieldIdToExclude);
        }

        private static LayoutKind GetLayoutKind(HttpRequestBase? httpRequest)
        {
            if (httpRequest is null)
            {
                return LayoutKind.Final;
            }

            var queryValue = httpRequest.QueryString?[LayoutKindParamName];
            var layoutKindRawValue = string.IsNullOrEmpty(queryValue)
                ? httpRequest.Headers?[LayoutKindParamName]
                : queryValue;

            if (Enum.TryParse(layoutKindRawValue, true, out LayoutKind layoutKind))
            {
                return layoutKind;
            }

            return LayoutKind.Final;
        }
    }
}
