// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.IO;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File
{
    public class GenericFile : IGenericFile
    {
        public GenericFile(string filePath)
        {
            FilePath = filePath;
            ParentFolderPath = Path.GetDirectoryName(FilePath);
            FileName = Path.GetFileName(FilePath);
        }

        public bool DoNotDelete { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string ParentFolderPath { get; set; }
        public byte[] Content { get; set; }
    }
}
