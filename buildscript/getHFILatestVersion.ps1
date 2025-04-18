param(
    [string]$PackageName="Sitecore.Horizon.Integration",
    [string]$NugetSourceFeed="https://nuget.sitecore.com/internal_prod/v3/index.json",
    [string]$CloudSmithUser,
    [string]$CloudSmithPassword
)

function Get-Credential {
   return New-Object Management.Automation.PSCredential($CloudSmithUser, (ConvertTo-SecureString $CloudSmithPassword -AsPlainText -Force))
}

$allVersions = Find-Package -Name $PackageName -Source $NugetSourceFeed -AllVersions -Credential (Get-Credential)
return $allVersions[0].Version
