param (
    [ValidateSet("Xmc", "XmcPagesEh", "Pages")]
    [string] $DeployMode = "Pages",
    [ValidateSet("qa", "staging")]
    [string] $SitecoreAppEnvironment = "staging",
    [string] $SerializeTestContent = "false",
    [string] $TestProjectName,
    [string] $TestArguments,
    [string] $CleanContainers = "false"

)
. .\utils\deployUtils.ps1

$buildArtifactsFolder = "$($PSScriptRoot)\..\artifacts" 
$fiArtifactsFolder = "$($PSScriptRoot)\..\container\build-images\cm\featureIntegrationArtifacts"
$hrzArtifactsFolder = "$($PSScriptRoot)\..\container\build-images\hrz\horizonArtifacts"
$deployFolder = "$($PSScriptRoot)\..\container\deploy\runspace"
$buildFolder = "$($PSScriptRoot)\..\container\build-images"
$cmHost = "xmcloudcm.localhost"
$pagesHost = "ah.$($cmHost)"
$rhHost = "eh.$($cmHost)"


Write-Host "##teamcity[blockOpened name='Clean-Up before deploy']"

Clear-DockerSystem

Invoke-CommandErrorsHandled { Invoke-Expression ( "docker system prune --force" ) }

Write-Host "Clear-ArtifactsFromBuildContext"
if (Test-Path $hrzArtifactsFolder) { Remove-Item $hrzArtifactsFolder -Force -Recurse }
if (Test-Path $fiArtifactsFolder) { Remove-Item $fiArtifactsFolder -Force -Recurse }
if (Test-Path $deployFolder) { Remove-Item -Path "$($deployFolder)\*" -Force -Recurse } else {
    New-Item -ItemType Directory -Path $deployFolder -Force | Out-Null
}

Write-Host "##teamcity[blockClosed name='Clean-Up before deploy']"

switch ($DeployMode) {
    "Xmc" {
        Prepare-DockerSetup-CMImage $buildArtifactsFolder $fiArtifactsFolder
        Build-Images -imagesList @("cm")
        Deploy-Containers -composefiles @("docker-compose.yml", "docker-compose.xmc.yaml")
        $hosts = @($cmHost)
    }
    "XmcPagesEh" {
        Prepare-DockerSetup-CMImage $buildArtifactsFolder $fiArtifactsFolder
        Prepare-HorizonArtifacts $hrzArtifactsFolder
        Prepare-JSSArtifacts $buildFolder
        Build-Images -imagesList @("cm", "hrz", "jsshost")
        $configParams = Get-ConfigValues ".\deploy.config.json"
        $CustomEnvParams = [PSCustomObject]@{
            COMPOSE_PROJECT_NAME                                          = "xmcloud-horizon"
            TOPOLOGY                                                      = "xmcloud"
            JSS_EDITING_SECRET                                            = "Headless"
            Sitecore_AppEnvironment                                       = $SitecoreAppEnvironment
            SITECORE_Pages_Client_Host                                    = $pagesHost
            SITECORE_Pages_Client_URL_Protocol                             = "https://"
            SITECORE_Pages_CORS_Allowed_Origins                           = "$pagesHost;https://localhost:5001"
            SITECORE_GRAPHQL_CORS                                         = "https://$pagesHost;https://localhost:5001"
            SITECORE_Pages_Auth0_Domain                                   = $configParams.customParameters.SitecoreFedAuthAuth0Domain
            SITECORE_Pages_Auth0_ClientId                                 = $configParams.customParameters.SitecoreFedAuthAuth0PagesClientId
            SITECORE_Pages_Auth0_Audience                                 = $configParams.customParameters.SitecoreFedAuthAuth0PagesAudience
            SITECORE_XmCloud_dot_OrganizationId                           = $configParams.customParameters.SitecoreXmCloudrganizationId
            SITECORE_XmCloud_dot_TenantId                                 = $configParams.customParameters.SitecoreXmCloudTenantId
            SITECORE_FedAuth_dot_Auth0_dot_IsLocal                        = $configParams.customParameters.SitecoreFedAuthAuth0IsLocal
            SITECORE_XmCloud_dot_Deploy_dot_Api_dot_Auth_dot_ClientId     = $configParams.customParameters.SitecoreFedAuthAuth0CliClientId
            SITECORE_XmCloud_dot_Deploy_dot_Api_dot_Auth_dot_ClientSecret = $configParams.customParameters.SitecoreFedAuthAuth0CliClientSecret
            EXPEDGE_CONNECTION                                            = $configParams.customParameters.xmCloudExpEdgeConnectionString
        }
        $envFile = Join-Path $deployFolder ".env"
        Update-DockerEnvFile $envFile $CustomEnvParams
        Deploy-Containers -composefiles @("docker-compose.yml", "docker-compose.override.yaml")
        $hosts = @($cmHost, $pagesHost, $rhHost)
    }
    "Pages" {
        Prepare-HorizonArtifacts $hrzArtifactsFolder
        $pagesHost = "pages-qa.sitecore-staging.cloud"
        $configParams = Get-ConfigValues ".\deploy.config.json"
        Build-Images -imagesList @("hrz")
        $envVars = [PSCustomObject]@{
            Sitecore_AppEnvironment                                       = $SitecoreAppEnvironment
            SITECORE_Pages_Auth0_Domain                                   = $configParams.customParameters.SitecoreFedAuthAuth0Domain
            SITECORE_Pages_Auth0_ClientId                                 = $configParams.customParameters.SitecoreFedAuthAuth0PagesClientId
            SITECORE_Pages_Auth0_Audience                                 = $configParams.customParameters.SitecoreFedAuthAuth0PagesAudience
            SITECORE_XmCloud_dot_Deploy_dot_Api_dot_Auth_dot_ClientId     = $configParams.customParameters.SitecoreFedAuthAuth0CliClientId
            SITECORE_XmCloud_dot_Deploy_dot_Api_dot_Auth_dot_ClientSecret = $configParams.customParameters.SitecoreFedAuthAuth0CliClientSecret
            SITECORE_Pages_Client_Host                                    = $pagesHost
            SITECORE_Pages_Client_URL_Protocol                            = "https://"
        }
        Copy-Item ".\..\container\deploy\.env" $deployFolder -Force
        $envFile = Join-Path $deployFolder ".env"
        Update-DockerEnvFile $envFile $envVars
        if (!(Test-Path "$deployFolder\traefik")) {
            New-Item -ItemType Directory -Path "$deployFolder\traefik" -Force | Out-Null
        }
        Deploy-Containers -composefiles @("docker-compose.pageswtraefik.yaml")
        $hosts = @($pagesHost)
    }
    Default {}
}

Add-Certificates-And-AddHostname -deployFolder $deployFolder -hosts $hosts

if ($SerializeTestContent -eq "true") {
    
    $sitecoreFedAuthAuth0Domain = "https://auth-staging-1.sitecore-staging.cloud"
    $sitecoreFedAuthAuth0CliAudience = "https://xmcloud-cm-staging.sitecore-staging.cloud"
    $sitecoreFedAuthAuth0CliClientId = $env:Org_ClientId
    $sitecoreFedAuthAuth0CliClientSecret = $env:Org_ClientSecret
    Write-Host "##teamcity[blockOpened name='Serialize content']"
    $sxaStarterFolder = ".\..\container\deploy\sxa-starter"
    Push-Location $sxaStarterFolder
    Write-Host "Installing Sitecore CLI..." -ForegroundColor Cyan
    Initialize-SitecoreCli

    Write-Host "Logging into Sitecore..." -ForegroundColor Cyan
    Login-SitecoreCli

    Write-Host "Setting up search indexes..." -ForegroundColor Green

    Write-Host "Populating schemas..."
    dotnet sitecore index schema-populate

    switch ($DeployMode) {
        "Xmc" {
            Write-Host "Pushing serialized items to cm..." -ForegroundColor Cyan
            dotnet sitecore ser push --include SXAHeadlessTenant
        }
        "XmcPagesEh" {
            Write-Host "Pushing serialized items to cm..." -ForegroundColor Cyan
            dotnet sitecore ser push --include RenderingHost, CustomComponent, Languages, SXAHeadlessTenant
        }

    }
    Write-Host "Rebuilding indexes..."
    dotnet sitecore index rebuild
    Pop-Location
    Write-Host "##teamcity[blockClosed name='Serialize content']"
}

if ($TestProjectName) {

    Write-Host "##teamcity[blockOpened name='Run Tests']"
    
    Push-Location "$($PSScriptRoot)\..\tests\$($TestProjectName)"
    if ($env:TEAMCITY_VERSION) {
        $logger = "-l teamcity" 
    }
    
    Write-Host "Run tests command: dotnet test $($TestArguments) $($logger)"
    Invoke-Expression "dotnet test $TestArguments $logger"
    Pop-Location

    Write-Host "##teamcity[blockClosed name='Run Tests']"

    Write-Host "##teamcity[blockOpened name='Collecting Docker logs']"
    switch ($DeployMode) {
        "Xmc" {
            Invoke-Expression "docker logs sitecore-xmcloud-cm-1 -t | out-file .\..\container\deploy\runspace\cmcontainer.log"
        }
        "XmcPagesEh" {
            Invoke-Expression "docker logs xmcloud-horizon-jsshost-1 -t | out-file .\..\container\deploy\runspace\jsscontainer.log"
            Invoke-Expression "docker logs xmcloud-horizon-hrz-1 -t | out-file .\..\container\deploy\runspace\hrzcontainer.log"
            Invoke-Expression "docker logs xmcloud-horizon-cm-1 -t | out-file .\..\container\deploy\runspace\cmcontainer.log"
        }
        "Pages" {
            Invoke-Expression "docker logs pages -t | out-file .\..\container\deploy\runspace\pagescontainer.log"
        }
    }

    Write-Host "##teamcity[blockClosed name='Collecting Docker logs']"

}

if ($CleanContainers -eq "true") {
    Remove-HostHeaders -hosts $hosts
    Clear-DockerSystem
}