// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File
{
    public interface IGenericFile
    {
        bool DoNotDelete { get; set; }
        string FileName { get; set; }
        string FilePath { get; set; }
        string ParentFolderPath { get; set; }
        byte[] Content { get; set; }
    }
}
