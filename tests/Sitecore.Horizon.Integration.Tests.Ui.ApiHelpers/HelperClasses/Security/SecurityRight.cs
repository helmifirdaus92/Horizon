// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security
{
    public enum SecurityRight
    {
        Read = UTF.HelperWebService.SecurityRight.Read,
        Write = UTF.HelperWebService.SecurityRight.Write,
        Rename = UTF.HelperWebService.SecurityRight.Rename,
        Create = UTF.HelperWebService.SecurityRight.Create,
        Delete = UTF.HelperWebService.SecurityRight.Delete,
        Administer = UTF.HelperWebService.SecurityRight.Administer,
        LanguageWrite = UTF.HelperWebService.SecurityRight.LanguageWrite,
        FieldRead = UTF.HelperWebService.SecurityRight.FieldRead,
        FieldWrite = UTF.HelperWebService.SecurityRight.FieldWrite,
        LanguageRead = UTF.HelperWebService.SecurityRight.LanguageRead,
        CreateBucket = UTF.HelperWebService.SecurityRight.CreateBucket,
        RevertBucket = UTF.HelperWebService.SecurityRight.RevertBucket,
        WorkflowStateDelete = UTF.HelperWebService.SecurityRight.WorkflowStateDelete,
        WorkflowStateWrite = UTF.HelperWebService.SecurityRight.WorkflowStateWrite,
        WorkflowCommandExecute = UTF.HelperWebService.SecurityRight.WorkflowCommandExecute
    }
}
