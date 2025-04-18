function GetMatchingChildItemPath($parentFolder, $itemPattern) {
  return Get-ChildItem $parentFolder | Where-Object { $_.Name -match "$itemPattern" } | Sort-Object | Select-Object -Last 1 | % { $_.FullName }
}

function InstallHorizonAuthoringHostPackage {
  param (
    [string]$horizonInstanceName,
    [string]$horizonPackagePath,
    [string]$horizonAppUrl,
    [string]$sitecoreInstansePath,
    [string]$sitecoreInstanceUrl,
    [string]$horizonPhysicalPath,
    [string]$identityServerUrl,
    [string]$licensePath
  )

  # Configure Horizon AuthoringHost
  $sitecoreHorizon = @{
    Path                 = Join-Path $PSScriptRoot "Configs\horizon-install-package.json"
    InstanceName         = $horizonInstanceName
    PhysicalPath         = $horizonPhysicalPath
    PackagePath          = $horizonPackagePath
    AppUrl               = $horizonAppUrl
    ContentManagementUrl = $sitecoreInstanceUrl
    LicensePath          = $licensePath
    IdentityServerUrl    = $identityServerUrl
  }

  Write-Host "Running InstallHorizon InstanceName: $($horizonInstanceName)" -ForegroundColor DarkCyan
  Install-SitecoreConfiguration @sitecoreHorizon -WorkingDirectory $PSScriptRoot
}

function UpdateIdentity {
  param (
    [string]$identityServerPoolName,
    [string]$identityServerPhysicalPath,
    [string]$horizonAppUrl
  )

  # Configure Identity
  $sitecoreIS = @{
    Path                       = Join-Path $PSScriptRoot "Configs\horizon-update-identity-server.json"
    HorizonApplicationUrl      = $horizonAppUrl
    IdentityServerPoolName     = $identityServerPoolName
    IdentityServerPhysicalPath = $identityServerPhysicalPath
  }

  Install-SitecoreConfiguration @sitecoreIS -WorkingDirectory $PSScriptRoot
}

function UpdateCM {
  param (
    [string]$sitecoreInstanceName,
    [string]$sitecoreInstansePath,
    [string]$horizonAppUrl,
    [string]$horizonFeatureIntegrationVersion,
    [string]$nugetPackageSources
  )

  # Configure CM instance
  $sitecoreCM = @{
    Path                             = Join-Path $PSScriptRoot "Configs\horizon-update-sitecore-instance.json"
    CMSiteName                       = $sitecoreInstanceName
    CMSitePhysicalPath               = [System.IO.DirectoryInfo]$sitecoreInstansePath
    HorizonFeatureIntegrationVersion = $horizonFeatureIntegrationVersion
    HorizonAppUrl                    = $horizonAppUrl
    NuGetPackageSources              = $nugetPackageSources
  }

  Write-Host "Running UpdateCM InstanceName: $($horizonInstanceName)" -ForegroundColor DarkCyan
  Install-SitecoreConfiguration @sitecoreCM -WorkingDirectory $PSScriptRoot
}

function InstallHorizonAuthoringHost {
  param (
    [string]$horizonHostPackagePath,
    [string]$horizonFeatureIntegrationVersion,
    [string]$horizonInstanceName,
    [string]$horizonPhysicalPath = "C:\inetpub\wwwroot\$horizonInstanceName",
    [string]$horizonAppUrl = "https://$horizonInstanceName",
    [string]$sitecoreCmInstanceName,
    [string]$sitecoreCmInstanceUrl = "https://$sitecoreCmInstanceName",
    [string]$sitecoreCmInstansePath = "C:\inetpub\wwwroot\$sitecoreCmInstanceName",
    [string]$identityServerPoolName,
    [string]$identityServerUrl = "https://$identityServerPoolName",
    [string]$identityServerPhysicalPath = "C:\inetpub\wwwroot\$identityServerPoolName",
    [string]$licensePath,
    [string]$nugetPackageSources
  )
  InstallHorizonAuthoringHostPackage `
    -horizonInstanceName $horizonInstanceName `
    -horizonPackagePath  $horizonHostPackagePath `
    -horizonPhysicalPath $horizonPhysicalPath `
    -horizonAppUrl $horizonAppUrl `
    -sitecoreInstansePath $sitecoreCmInstansePath `
    -sitecoreInstanceUrl $sitecoreCmInstanceUrl `
    -identityServerUrl $identityServerUrl `
    -licensePath $licensePath

  UpdateIdentity `
    -identityServerPoolName $identityServerPoolName `
    -identityServerPhysicalPath $identityServerPhysicalPath `
    -horizonAppUrl $horizonAppUrl

  UpdateCM `
    -sitecoreInstanceName $sitecoreCmInstanceName `
    -horizonAppUrl $horizonAppUrl `
    -sitecoreInstansePath $sitecoreCmInstansePath `
    -horizonFeatureIntegrationVersion $horizonFeatureIntegrationVersion `
    -topology $topology `
    -nugetPackageSources $nugetPackageSources
}

function Uninstall-HorizonAuthoringHost {
  param (
    [Parameter(Mandatory = $true)]
    [string]$InstanceName,
    [string]$PhysicalPath = "$env:SystemDrive\inetpub\wwwroot\$InstanceName"
  )

  $sitecoreAH = @{
    Path                 = Join-Path $PSScriptRoot "Configs\horizon-install-package.json"
    InstanceName         = $InstanceName
    PhysicalPath         = $PhysicalPath
    # Following parameters aren't needed for uninstall
    PackagePath          = "empty"
    AppUrl               = "empty"
    ContentManagementUrl = "empty"
    LicensePath          = "empty"
    IdentityServerUrl    = "empty"
  }
  Write-Host "Uninstalling Horizon Authoring: $($InstanceName)" -ForegroundColor DarkCyan
  Uninstall-SitecoreConfiguration @sitecoreAH -WorkingDirectory $PSScriptRoot
}
