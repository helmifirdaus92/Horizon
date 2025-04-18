// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features;

public class SelectDevice : BaseFixture
{
    [OneTimeSetUp]
    public void OpenSXASite()
    {
        Preconditions.OpenSXAHeadlessSite();
    }

    [OneTimeTearDown]
    public void SelectDesktopSmallDevice()
    {
        Context.Pages.Editor.EditorHeader.Device.SelectDevice("Desktop Small");
    }

    [TestCase("Mobile", "370")]
    [TestCase("Tablet Portrait", "768")]
    [TestCase("Desktop Small", "1024")]
    public void TheViewSizeIsFixed_TopPanelSelection(string device, string width)
    {
        Context.Pages.Editor.EditorHeader.Device.SelectDevice(device);
        Context.Pages.Editor.EditorHeader.Device.SelectedDevice.Should().Be($"{device} ({width}px)");
        Context.Pages.Editor.CanvasRectangle.Width.ToString().Should().Be(width);
    }

    [TestCase("Mobile", "370")]
    [TestCase("Tablet Portrait", "768")]
    [TestCase("Desktop Small", "1024")]
    public void TheViewSizeIsFixed_DeviceSelection(string device, string width)
    {
        Context.Pages.Editor.EditorHeader.Device.SwitchToDevice(device);
        Context.Pages.Editor.EditorHeader.Device.SelectedDevice.Should().Be($"{device} ({width}px)");
        Context.Pages.Editor.CanvasRectangle.Width.ToString().Should().Be(width);
    }

    [Test]
    public void AddAndRemoveBreakpointsFromDeviceSelector()
    {
        var devices = Context.Pages.Editor.EditorHeader.Device.OpenBreakPoints();
        devices.Items.Find(d => d.Name.Contains("Desktop Regular")).AddToDeviceSelector();
        devices.Items.Find(d => d.Name.Contains("Desktop Large")).AddToDeviceSelector();
        devices.CloseBreakPoints();

        Context.Pages.Editor.EditorHeader.Device.DevicesList.Should().Contain("Desktop Large (1536px)");
        Context.Pages.Editor.EditorHeader.Device.DevicesList.Should().Contain("Desktop Regular (1280px)");

        devices = Context.Pages.Editor.EditorHeader.Device.OpenBreakPoints();
        devices.Items.Find(d => d.Name.Contains("Desktop Large")).RemoveFromDeviceSelector();

        Context.Pages.Editor.EditorHeader.Device.DevicesList.Should().NotContain("Desktop Large (1536px)");
        Context.Pages.Editor.EditorHeader.Device.DevicesList.Should().Contain("Desktop Regular (1280px)");
        devices.CloseBreakPoints();

        Context.Pages.Editor.EditorHeader.Device.SelectDevice("Desktop Regular");
        Context.Pages.Editor.EditorHeader.Device.SelectedDevice.Should().Be("Desktop Regular (1280px)");
        Context.Pages.Editor.CanvasRectangle.Width.ToString().Should().Be("1280");
    }
}
