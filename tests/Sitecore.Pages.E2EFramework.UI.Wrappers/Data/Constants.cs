// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

public static class Constants
{
    public static string CdkOverlayContainerCdkOverlayPane = ".cdk-overlay-container .cdk-overlay-pane";
    public static string DuplicateDialogLocator = "app-duplicate-item-dialog";
    public static string MoveItemDialogLocator = "app-move-item-dialog";
    public static string RenameItemDialogLocator = "app-rename-item-dialog";
    public static string PageDetailsDialogLocator = "app-page-details-dialog";
    public static string PageAbTestsDetailsDialogLocator = "page-ab-tests-details-dialog";
    public static string WarningDialogLocator = "app-warning-dialog";
    public static string ContentItemDialogLocator = "app-content-item-dialog";
    public static string DatasourceDialogLocator = "app-datasource-dialog";
    public static string TemplatesFeatureNotAvailableDialog_ExpectedTextInFirstParagraph = "Templates, page designs, and partial designs are only available for headless SXA sites.";
    public static string TemplatesFeatureNotAvailableDialog_ExpectedTextInSecondParagraph = "To use features like this and more, start creating headless SXA sites.";
    public static string AppPageDesignsLocator = "app-page-designs";
    public static string AppPartialDesignsLocator = "app-partial-designs";
    public static string AppPageBranchesLocator = "app-page-branches";
    public static string AppPageTemplatesLocator = "app-page-templates";
    public static string AppLeftHandSideLocator = "app-left-hand-side";
    public static string AppRightHandSideLocator = "app-editor-rhs";
    public static string DialogPanelLocator = "ng-spd-dialog-panel";
    public static string PreviewLocator = "app-horizon-workspace-header-preview-link [title=Preview]";
    public static string RenderingCodeSelector = "code[chrometype='rendering'][kind='open']";
    public static string ComponentsGallerySelector = "app-component-gallery";
    public static string CanvasCssSelector = "iframe.editor";
    public static string TemplateSelectionDialogLocator = "app-template-selection-dialog";
    public static string CreateFolderPanelSelector = "app-create-folder";
    public static string WorkflowConfirmationDialogLocator = "app-workflow-confirmation-dialog";

    public static string RenderingNameInHtmlFromName(string componentName)
    {
        return componentName switch
        {
            "Custom Component" =>"customcomponent",
            "Rich Text" => "rich-text",
            "Title" => "title",
            "Image" => "image",
            "Link List" => "link-list",
            "Promo" => "promo",
            "Page Content" => "content",
            "Container" => "container-default",
            _ => string.Empty
        };
    }
    public static string RenderingNameFromInHtml(string componentNameFromHTML)
    {
        return componentNameFromHTML switch
        {
            "customcomponent" =>"Custom Component",
            "rich-text" => "Rich Text",
            "title" => "Title",
            "image" => "Image",
            "link-list" => "Link List",
            "promo" => "Promo",
            "content" => "Page Content",
            "container-default" => "Container",
            _ => string.Empty
        };
    }
}
