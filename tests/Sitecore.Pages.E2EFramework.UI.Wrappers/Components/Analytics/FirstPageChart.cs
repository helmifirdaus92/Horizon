// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.ObjectModel;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class FirstPageChart : BaseControl, IChart
{
    public FirstPageChart(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public int RowsCount => Table.FindElements("tr").Count;

    private IWebElement Table => Container.FindElement("table tbody");

    public void Click()
    {
        Container.Click();
    }

    public List<FirstPageColumns> GetTableData()
    {
        List<FirstPageColumns> tableData = new();

        List<IWebElement> rows = Table.FindElements("tr").ToList();

        foreach (IWebElement rowElement in rows)
        {
            FirstPageColumns row = new();
            List<IWebElement> rowCells = GetRowCells(rowElement).ToList();

            for (int j = 0; j < rowCells.Count; j++)
            {
                switch (j)
                {
                    case 0:
                        row.Name = rowCells[j].Text;
                        break;
                    case 1:
                        row.PreviousPeriod = rowCells[j].Text;
                        break;
                    case 2:
                        row.RecentPeriod = rowCells[j].Text;
                        break;
                    case 3:
                        row.Trend = rowCells[j].Text;
                        break;
                }
            }

            tableData.Add(row);
        }

        return tableData;
    }

    private IEnumerable<IWebElement> GetRowCells(IWebElement row)
    {
        ReadOnlyCollection<IWebElement> cellsPerRow = row.FindElements(("td"));
        return cellsPerRow;
    }
}

public class FirstPageColumns
{
    public string? Name { get; set; }
    public string? PreviousPeriod { get; set; }
    public string? RecentPeriod { get; set; }
    public string? Trend { get; set; }
}
