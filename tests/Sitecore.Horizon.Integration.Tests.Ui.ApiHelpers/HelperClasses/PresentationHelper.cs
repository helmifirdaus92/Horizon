// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Text;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Properties;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses
{
    public static class PresentationHelper
    {
        public static byte[] GenerateRenderingFile(LayoutType pageType, List<PageField> fields)
        {
            var endLine = Environment.NewLine;
            string code;
            switch (pageType)
            {
                case LayoutType.Mvc:
                    code = Encoding.Default.GetString(Resources.MvcRenderingStart) + endLine;
                    foreach (var field in fields)
                    {
                        code += GenerateMvcField(field.FieldName);
                    }

                    code += "</div>";
                    break;

                //XSLT rendering
                default:
                    code = Encoding.Default.GetString(Resources.XsltRenderingStart) + endLine;
                    foreach (var pageField in fields)
                    {
                        switch (pageField.FieldType)
                        {
                            case PageFieldType.CheckList:
                            case PageFieldType.DropLink:
                            case PageFieldType.DropTree:
                            case PageFieldType.CheckBox:
                            case PageFieldType.DropList:
                            case PageFieldType.SingleLineText:
                            case PageFieldType.Text:
                            case PageFieldType.Number:
                            case PageFieldType.Integer:
                            case PageFieldType.Password:
                            case PageFieldType.MessageText:
                                code += GenerateXsltField(pageField.FieldName, "text");
                                break;
                            case PageFieldType.RichText:
                                code += GenerateXsltField(pageField.FieldName, "html");
                                break;
                            case PageFieldType.GeneralLink:
                            case PageFieldType.GeneralLinkWithSearch:
                                code += GenerateXsltField(pageField.FieldName, "link");
                                break;
                            case PageFieldType.MultiLineText:
                                code += GenerateXsltField(pageField.FieldName, "memo");
                                break;
                            case PageFieldType.Date:
                            case PageFieldType.Datetime:
                                code += GenerateXsltField(pageField.FieldName, "date");
                                break;
                            case PageFieldType.Image:
                                code += GenerateXsltField(pageField.FieldName, "image");
                                break;
                        }
                    }

                    code += $"</xsl:template >{endLine}</xsl:stylesheet >";
                    break;
            }

            return Encoding.ASCII.GetBytes(code);
        }

        private static string GenerateXsltField(string fieldName, string fieldType)
        {
            return $"<div class=\"{fieldName}\" style=\"width: fit-content;\"><sc:{fieldType} field=\"{fieldName}\" /></div>{Environment.NewLine}";
        }

        private static string GenerateMvcField(string fieldName, string fieldType = "Field")
        {
            return $"<div class=\"{fieldName}\" style=\"width: fit-content;\">@Html.Sitecore().{fieldType}(\"{fieldName}\")</div>{Environment.NewLine}";
        }
    }
}
