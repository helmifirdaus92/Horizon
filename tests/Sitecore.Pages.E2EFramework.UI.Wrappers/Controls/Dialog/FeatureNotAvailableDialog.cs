// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class FeatureNotAvailableDialog : DialogBase
    {
        public FeatureNotAvailableDialog(IWebElement container) : base(container)
        {
        }

        public void ClickDismissButton() { ClickActionButton("Dismiss"); }

        public Dictionary<string, string> GetParagraphs()
        {
            Dictionary<string, string> textsDictionary = new Dictionary<string, string>();

            var paragraphElements = Container.FindElements("p");

            string firstParagraphText = paragraphElements[0].Text;
            textsDictionary.Add("firstParagraph", firstParagraphText);

            string secondParagraphText = paragraphElements[1].Text;
            textsDictionary.Add("secondParagraph", secondParagraphText);

            return textsDictionary;
        }

        public bool CheckTextInFirstParagraph()
        {
            var paragraphs = GetParagraphs();
            return paragraphs.TryGetValue("firstParagraph", value: out string? firstParagraphText) && firstParagraphText
                .Contains(Constants.TemplatesFeatureNotAvailableDialog_ExpectedTextInFirstParagraph);
        }

        public bool CheckTextInSecondParagraph()
        {
            var paragraphs = GetParagraphs();
            return paragraphs.TryGetValue("secondParagraph", out string? secondParagraphText) && secondParagraphText
                .Contains(Constants.TemplatesFeatureNotAvailableDialog_ExpectedTextInSecondParagraph);
        }
    }
}
