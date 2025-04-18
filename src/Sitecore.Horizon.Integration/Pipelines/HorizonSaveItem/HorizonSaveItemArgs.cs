// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    internal class HorizonArgsSaveField : SaveArgs.SaveField
    {
        private bool _reset = false;
        public bool Reset
        {
            get
            {
                return _reset;
            }
            set
            {
                _reset = value;
            }
        }
    }
    internal class HorizonArgsSaveItem: SaveArgs.SaveItem
    {
        private List<HorizonArgsSaveField> _fields = new List<HorizonArgsSaveField>();

        public new List<HorizonArgsSaveField> Fields {
            get
            {
                return _fields;
            }
            set
            {
                _fields = value;
            }
        }
    }

    internal struct HorizonSaveItemArgs : IHorizonPipelineArgs
    {
        public bool Aborted { get; set; }

        [SuppressMessage("Microsoft.Performance", "CA1819:PropertiesShouldNotReturnArrays", Justification = "Not a readonly property")]
        public IReadOnlyList<HorizonArgsSaveItem> Items { get; set; }

        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "This pipeline property is not meant to be generic")]
        public List<SaveItemError> Errors { get; init; }

        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "This pipeline property is not meant to be generic")]
        public List<string> Warnings { get; init; }

        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "This pipeline property is not meant to be generic")]
        public List<HorizonArgsSaveItem> SavedItems { get; init; }

        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "This pipeline property is not meant to be generic")]
        public List<ValidationError> ValidationErrors { get; init; }

        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "This pipeline property is not meant to be generic")]
        public HashSet<ItemVersionInfo> NewCreatedVersions { get; init; }

        public static HorizonSaveItemArgs Create()
        {
            return new()
            {
                Items = Array.Empty<HorizonArgsSaveItem>(),
                Errors = new List<SaveItemError>(),
                Warnings = new(),
                SavedItems = new(),
                ValidationErrors = new(),
                NewCreatedVersions = new HashSet<ItemVersionInfo>()
            };
        }

        public void AddError(SaveItemError error)
        {
            Errors.Add(error);
        }

        public void AddErrorAndAbortPipeline(SaveItemError error)
        {
            Errors.Add(error);
            Aborted = true;
        }
    }
}
