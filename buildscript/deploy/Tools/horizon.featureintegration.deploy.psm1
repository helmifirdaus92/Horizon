function Invoke-InstallFeatureIntegrationContentPackage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SiteName,
        [Parameter(Mandatory = $true)]
        [string]$SiteFolder,
        [Parameter(Mandatory = $true)]
        [string]$Version,
        [Parameter(Mandatory = $true)]
        [string]$Sources
    )

    $tempFolderPath = Join-Path $Env:Temp $(New-Guid)
    try {
        Write-Information "Creating temp folder. Path: $tempFolderPath"
        New-Item -ItemType Directory -Path $tempFolderPath | Out-Null

        $nuspecFileName = "Sitecore.Horizon.Integration.XM.Content.Reference.nuspec"
        $nuspecFilePath = "tools\$nuspecFileName"
        Write-Information "Creating temp NuGet package. NuSpec: '$nuspecFileName' FIVersion: '$Version'"
        & nuget pack $nuspecFilePath -OutputDirectory $tempFolderPath -Properties FIVersion=$Version


        $allSources = "$Sources;$tempFolderPath"
        Write-Information "Installing FeatureIntegration content meta-package using Legoland"
        Install-LegolandPackage `
            -PackageId "Sitecore.Horizon.Integration.Content.Reference" `
            -InstanceName $SiteName `
            -TargetDirectory "$SiteFolder" `
            -Source "$allSources" `
            -DependencyVersion "Highest" `
            -LegacyRevert `
            -GenerateResources `
            -oldLayout $false

        Write-Information "FeatureIntegration content package was installed!"
    } finally {
        Write-Information "Removing temp folder: '$tempFolderPath'"
        Remove-Item -Path $tempFolderPath -Recurse -Force
    }
}

Register-SitecoreInstallExtension -Command Invoke-InstallFeatureIntegrationContentPackage -As InstallFeatureIntegrationContentPackage -Type Task
