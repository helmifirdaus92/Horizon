Import-Module "$PSScriptRoot\deploy\InstallerModules.psm1" -Force
$global:authoringHostPostfix = "-ah"
$cleanInstanceCalledBeforeDeployment = $true

Function Complete-PostInstanceAvailable {
    Print-FunctionInfo "$($MyInvocation.MyCommand)" $args

    if ($args.useCustomDeploy -eq $true) {

        $targetOS = $env:targetOs
        if ([string]::IsNullOrEmpty($targetOs)) {
            $targetOS = "ltsc2019"
        }
        Write-Host "Use custome deploy with target OS:$($targetOS)"

        #Hard code for now till ps ads accepts xmcloud topology
        $Topology = "xmcloud"

        if ($args.runSwitches.customComposeDeploy -eq $true) {
            Write-Host "[Invoke-CustomInstanceDeployment] Starting custom docker compose deployment."
            $fiArtifactsFolder = ".\..\container\build-images\cm\featureIntegrationArtifacts"
            $utfArtifactsFolder = ".\..\container\build-images\cm\utf"
            $hrzArtifactsFolder = ".\..\container\build-images\hrz\horizonArtifacts"
            Clear-ArtifactsFromBuildContext $fiArtifactsFolder $hrzArtifactsFolder $utfArtifactsFolder
            Extract-FeatureIntegrationArtifacts $fiArtifactsFolder $args
            Patch-HorizonIntegrationConfig $fiArtifactsFolder
            Extract-HorizonArtifacts $hrzArtifactsFolder $args
            $EnableSO = !!($args.runSwitches.WithSpeedOptimization)
            Write-Host "Enable Speed Optimization : $EnableSO"
            $SitecoreAppEnvironment= "qa"
            if($EnableSO){
                $SitecoreAppEnvironment= "staging"
            }
            $ahDomainName = "ah.$($Topology)cm.localhost"
            $CustomEnvParams = [PSCustomObject]@{
                COMPOSE_PROJECT_NAME                                                   = "xmcloud-horizon"
                TOPOLOGY                                                               = $Topology
                JSS_EDITING_SECRET                                                     = "Headless"
                Sitecore_AppEnvironment                                                = $SitecoreAppEnvironment
                SITECORE_Pages_Client_Host                                             = $ahDomainName
                SITECORE_Pages_Client_URL_Protocol                                     = "https://"
                SITECORE_Pages_CORS_Allowed_Origins                                    = "$ahDomainName;https://localhost:5001"
                SITECORE_GRAPHQL_CORS                                                  = "https://$ahDomainName;https://localhost:5001"
                SITECORE_Pages_Auth0_Domain                                            = $args.customParameters.SitecoreFedAuthAuth0Domain
                SITECORE_Pages_Auth0_ClientId                                          = $args.customParameters.SitecoreFedAuthAuth0PagesClientId
                SITECORE_Pages_Auth0_Audience                                          = $args.customParameters.SitecoreFedAuthAuth0PagesAudience
                SITECORE_XmCloud_dot_OrganizationId                                    = $args.customParameters.SitecoreXmCloudrganizationId
                SITECORE_XmCloud_dot_TenantId                                          = $args.customParameters.SitecoreXmCloudTenantId
                SITECORE_FedAuth_dot_Auth0_dot_IsLocal                                 = $args.customParameters.SitecoreFedAuthAuth0IsLocal
                SITECORE_XmCloud_dot_Deploy_dot_Api_dot_Auth_dot_ClientId              = $args.customParameters.SitecoreFedAuthAuth0CliClientId
                SITECORE_XmCloud_dot_Deploy_dot_Api_dot_Auth_dot_ClientSecret          = $args.customParameters.SitecoreFedAuthAuth0CliClientSecret
                EXPEDGE_CONNECTION                                                     = $args.customParameters.xmCloudExpEdgeConnectionString
            }
            if (![string]::IsNullOrEmpty($args.servicePrincipalClientSecret) ){
                az login --service-principal -u $args.servicePrincipalClientId -p $args.servicePrincipalClientSecret --tenant $args.servicePrincipalTenantId
                az acr login --name $args.customParameters.azureConatinerRegistry
            }

            . ./../container/scripts/DeployCompose.ps1 -Topology $Topology `
                -TargetOs $targetOs `
                -PlatformTag $args.containersSitecoreTag `
                -ProgramVersion $global:programIdentifier `
                -ClientId "$($args.servicePrincipalClientId)" `
                -ClientSecret "$($args.servicePrincipalClientSecret)" `
                -CustomEnvParams  $CustomEnvParams `
                -EnableSXA $args.runSwitches.enableSXA `
                -EnableDAM $args.runSwitches.enableContentHub

                Create-SXAHeadlessTenantAndSite(@($args));
        }
    }
    else {
        $isDeployModules = [System.Convert]::ToBoolean($args.deployModules)
        if (!$isDeployModules) {
            Write-Host "deployModules is false. Installing Horizon" -ForegroundColor Green
            InstallHorizon(@($args))
            if ($args.runSwitches.enableSXA) {
                InstallSxa(@($args))
            }
        }

        if ($args.runSwitches.enableContentHub) {
            InstallDamConnector(@($args));
        }
    }
}

function Create-SXAHeadlessTenantAndSite{

    $sxaStarterFolder = ".\..\container\deploy\sxa-starter"
    Push-Location $sxaStarterFolder
    Write-Host "Installing Sitecore CLI..." -ForegroundColor Cyan
    Initialize-SitecoreCli

    Write-Host "Logging into Sitecore..." -ForegroundColor Cyan
    Login-SitecoreCli(@($args))

    Write-Host "Setting up search indexes..." -ForegroundColor Green

    Write-Host "Populating schemas..."
    dotnet sitecore index schema-populate

    Write-Host "Pushing serialized items to cm..." -ForegroundColor Cyan
    dotnet sitecore ser push --include RenderingHost, CustomComponent, SXAHeadlessTenant

    Write-Host "Rebuilding indexes..."
    dotnet sitecore index rebuild
    Pop-Location
}

function Initialize-SitecoreCli{

    $dotnetToolConfigFolder = ".config"
    $dotnetToolCacheFolder = "~\.dotnet\toolResolverCache\1"
    if (Test-Path $dotnetToolConfigFolder) { Remove-Item $dotnetToolConfigFolder -Force -Recurse }
    # Clear dotnet tool cache for sitecore.cli (there might be an error due to a bug)
    if (Test-Path $dotnetToolCacheFolder) {
        Push-Location $dotnetToolCacheFolder
        Remove-Item "sitecore.cli" -Force -Erroraction silentlycontinue
        Pop-location
    }

    dotnet new tool-manifest --force
    dotnet tool install Sitecore.CLI --version "5.*" --ignore-failed-sources
    dotnet tool restore --tool-manifest .config\dotnet-tools.json

    Write-Host "Waiting for tool restore to take effect..." -ForegroundColor Green
    Start-Sleep -Seconds 5
    dotnet sitecore init
    dotnet sitecore plugin init --overwrite
}
function Login-SitecoreCli {

    dotnet sitecore login --cm "https://$($Topology)cm.localhost" `
            --auth $args.customParameters.SitecoreFedAuthAuth0Domain `
            --audience $args.customParameters.SitecoreFedAuthAuth0CliAudience `
            --client-id $args.customParameters.SitecoreFedAuthAuth0CliClientId `
            --client-secret $args.customParameters.SitecoreFedAuthAuth0CliClientSecret `
            --client-credentials true `
            --allow-write true
}
function Extract-HorizonArtifacts {
    param (
        [string] $hrzArtifactsFolder
    )
    Write-Host "Extract-HorizonArtifacts"
    Expand-Archive `
        -Path .\..\artifacts\HorizonHost.*.zip `
        -DestinationPath $hrzArtifactsFolder `
        -Force
}
function Extract-FeatureIntegrationArtifacts {
    param (
        [string] $fiArtifactsFolder
    )
    Write-Host "Extract-FeatureIntegrationArtifacts"
    #register the module with Legoland overrides
    $env:PSModulePath = "$PSScriptRoot;$env:PSModulePath"
    Install-LegolandPackage `
        -PackageId "Sitecore.Horizon.Integration.XM.Content" `
        -InstanceName "abc" `
        -TargetDirectory $fiArtifactsFolder `
        -Source "$($args.localSources);$($args.programNugetFeed)" `
        -GenerateResources:$true `
        -oldLayout $false
}

function Patch-HorizonIntegrationConfig {
    param (
        [string] $fiArtifactsFolder
    )
    Write-Host "Patch-HorizonIntegrationConfig"
    $xml = New-Object XML
    $horizonConfigFile = "$($fiArtifactsFolder)\App_Config\Modules\Horizon\Sitecore.Horizon.Integration.config"
    $xml.Load($horizonConfigFile )
    $horizonClientHostElement = $xml.SelectSingleNode("/configuration/sitecore/settings/setting[@name='Horizon.ClientHost']")
    $horizonClientHostElement.SetAttribute("value", "`$(env:Sitecore_Horizon_ClientHost)")
    $xml.Save($horizonConfigFile )
}

function Clear-ArtifactsFromBuildContext {
    param (
        [string] $fiArtifactsFolder,
        [string] $hrzArtifactsFolder,
        [string] $utfArtifactsFolder
    )
    Write-Host "Clear-ArtifactsFromBuildContext"
    if (Test-Path $hrzArtifactsFolder) { Remove-Item $hrzArtifactsFolder -Force -Recurse }
    if (Test-Path $fiArtifactsFolder) { Remove-Item $fiArtifactsFolder -Force -Recurse }
    if (Test-Path $utfArtifactsFolder) { Remove-Item $utfArtifactsFolder -Force -Recurse }
  }

function GetBaseRepoDirectoryPath {
   return (Get-Item $PSScriptRoot).Parent.Fullname
}

function GetHorizonHostPackagePath {
    $horizonHostPackageFolder = "$(GetBaseRepoDirectoryPath)\artifacts"
    return GetMatchingChildItemPath $horizonHostPackageFolder "HorizonHost.*\d{5}(\.\d+)?\.zip"
}

function InstallHorizon {
    $actualTopologyInfo = GetActualTopologyInfo(@($args))
    $cmName = $actualTopologyInfo.managementInstanceName
    $horizonFeatureIntegrationVersion = $args.customParameters.featureIntegration.version;
    $nugetPackageSources = "$($args.localSources);$($args.programNugetFeed)";

    $installArgs = @{
        horizonHostPackagePath           = GetHorizonHostPackagePath
        horizonFeatureIntegrationVersion = $horizonFeatureIntegrationVersion
        horizonInstanceName              = "$($args.instanceName)$authoringHostPostfix"
        sitecoreCmInstanceName           = $cmName
        licensePath                      = "\\mars\Installs\Licenses\Sitecore Partner License\license.xml"
        identityServerPoolName           = "$($args.instanceName)-IdentityServer"
        nugetPackageSources              = $nugetPackageSources
    }

    InstallHorizonAuthoringHost @installArgs
}

function Complete-PostAllPackagesInstall {
    Print-FunctionInfo "$($MyInvocation.MyCommand)" $args

    $actualTopologyInfo = GetActualTopologyInfo(@($args))
    $cmPhysicalPath = $actualTopologyInfo.managementInstancePhysicalPath

    Write-Host "Running ApplyWorkarounds with cmPhysicalPath:  $cmPhysicalPath " -ForegroundColor DarkCyan
    ApplyWorkarounds $cmPhysicalPath

    $skipChDamPluginTestsDeployment = !($args.runSwitches.enableContentHub)
    $skipGraphQLIntegrationTests = !($args.runSwitches.GraphQLIntegrationTests)
    $skipExtensibilityTests = !($args.runSwitches.Extensibility)
    $newE2ETests = If ($null -eq ($args.runSwitches.NewE2ETests)) {$false} Else {($args.runSwitches.NewE2ETests)}
    $useCustomComposeDeploy = !!($args.runSwitches.customComposeDeploy)
    PatchTestConfiguration $actualTopologyInfo $skipChDamPluginTestsDeployment $skipGraphQLIntegrationTests $skipExtensibilityTests $newE2ETests $useCustomComposeDeploy

    if ($actualTopologyInfo.topology -eq "XP1") {
        WarmUp-Instance $actualTopologyInfo.processingInstanceUrl
    }

    if($newE2ETests) {
        if ($env:TEAMCITY_VERSION) {
            $logger = "-l teamcity" 
        }
        Push-Location $PSScriptRoot\..\tests\SItecore.Pages.E2EFramework.UI.Tests
        if ($args.runSwitches.WithSpeedOptimization){
            Invoke-Expression "dotnet test --filter 'Category!=De-scopedWithSpeedOptimization' $logger"
        }
        else {
            Invoke-Expression "dotnet test $logger"
        }
        Pop-Location
        Invoke-Expression "docker logs xmcloud-horizon-jsshost-1 -t | out-file .\..\container\deploy\runspace\jsscontainer.log"
        Invoke-Expression "docker logs xmcloud-horizon-hrz-1 -t | out-file .\..\container\deploy\runspace\hrzcontainer.log"
        Invoke-Expression "docker logs xmcloud-horizon-cm-1 -t | out-file .\..\container\deploy\runspace\cmcontainer.log"
    }
}

function Complete-PostCleanInstance () {
    if($cleanInstanceCalledBeforeDeployment){
        CleanInstance (@($args))
        $cleanInstanceCalledBeforeDeployment= $false
    }
    elseif ($args.cleanInstance -eq $true) {
        CleanInstance (@($args))
        RemoveTestImages(@($args))
    }
}

function CleanInstance () {
    Print-FunctionInfo "$($MyInvocation.MyCommand)" $args
    Write-Host "Cleaning up instance is started!" -ForegroundColor Green

    if ($args.useCustomDeploy -eq "true") {
        if ($args.runSwitches.customComposeDeploy -eq $true) {
            Write-Host "Complete-PostCleanInstance ()"
            Clear-DockerSystem
            . ./../container/scripts/dockerUtils.ps1
            Invoke-CommandErrorsHandled { Invoke-Expression ( "docker system prune --force" ) }
            RemoveHostsHrz -Topology $args.topology
        }
    }
    else {
        Uninstall-HorizonAuthoringHost -InstanceName "$($args.instanceName)$authoringHostPostfix"
    }
}

function RemoveTestImages () {
    if ($args.runSwitches.customComposeDeploy -eq $true) {
        Write-Host "Deleting test images : sitecore-horizon-integration-xmcloud-cm & sitecore-horizon"
        docker rmi sitecore-horizon-integration-xmcloud-cm --force
        docker rmi sitecore-horizon --force
    }
}

function GetActualTopologyInfo {
    $xConnectInstanceName = $args.instanceName + "_xconnect"
    $managementInstanceName = $args.instanceName
    $cdInstanceName = $args.instanceName
    $procesingInstanceName = $args.instanceName
    $managementInstancePhysicalPath = [System.IO.DirectoryInfo]$args.targetDir
    $topology = $args.topology
    $processingInstancePhysicalPath = [System.IO.DirectoryInfo]$args.targetDir
    $collectionInstanceName = $xConnectInstanceName
    $searchInstanceName = $xConnectInstanceName
    $deployedTestsLocation = [System.IO.DirectoryInfo] $args.customParameters.deployedTestsLocation
    $skipTestsDeployment = "SkipTestsDeployment" -in $args.runSwitches.SkipTestsDeployment
    $processingInstanceUrl = "https://$($procesingInstanceName)"
    $damInstanceUrl = $args.customParameters.damSiteUrl
    $hrzInstanceName = $($args.instanceName) + "-ah"

    $skipTestsDeployment =
    if ("SkipTestsDeployment" -in $args.runSwitches.PSobject.Properties.Name) {
        $args.runSwitches.SkipTestsDeployment
    }
    else {
        $false
    }

    if ($topology -ne "XP0") {
        Write-Host "GetActualTopologyInfo: Topology detected - $topology" -ForegroundColor DarkYellow
        Write-Host "GetActualTopologyInfo: PhysicalPath - $managementInstancePhysicalPath" -ForegroundColor DarkYellow

        $managementInstanceName = $args.instanceName + "CM"
        $cdInstanceName = $args.instanceName + "CD"
        $managementInstancePhysicalPath = Join-Path $managementInstancePhysicalPath.Parent.FullName $managementInstanceName
        Write-Host "GetActualTopologyInfo: managementInstanceName: $managementInstanceName"

        $procesingInstanceName = $args.instanceName + "Prc"
        $processingInstanceUrl = "https://$($procesingInstanceName)/"
        $processingInstancePhysicalPath = Join-Path $processingInstancePhysicalPath.Parent.FullName $procesingInstanceName
        Write-Host "GetActualTopologyInfo: procesingInstanceName: $procesingInstanceName"

        $collectionInstanceName = $args.instanceName + "_collection"
        $searchInstanceName = $args.instanceName + "_collectionsearch"
    }
    $topologyInfo = @{
        "originalInstanceName"           = $args.instanceName
        "managementInstanceName"         = $managementInstanceName
        "cdInstanceName"                 = $cdInstanceName
        "managementInstancePhysicalPath" = $managementInstancePhysicalPath.toString()
        "processingInstancePhysicalPath" = $processingInstancePhysicalPath.toString()
        "collectionInstanceName"         = $collectionInstanceName
        "searchInstanceName"             = $searchInstanceName
        "procesingInstanceName"          = $procesingInstanceName
        "processingInstanceUrl"          = $processingInstanceUrl
        "topology"                       = $topology
        "deployedTestsLocation"          = $deployedTestsLocation.FullName
        "skipTestsDeployment"            = $skipTestsDeployment
        "damInstanceUrl"                 = $damInstanceUrl
        "hrzInstanceName"                = $hrzInstanceName
    }

    if ($args.runSwitches.customComposeDeploy -eq $true) {
        $topologyInfo.managementInstanceName = "xmcloudcm.localhost";
        $topologyInfo.hrzInstanceName = "ah.xmcloudcm.localhost"
    }
    Write-Host "GetActualTopologyInfo returned : " + $topologyInfo
    return $topologyInfo
}

function ApplyWorkarounds($websiteDir) {
    if ($args.runSwitches.customComposeDeploy -eq $true) {
        Write-Host "ApplyWorkarounds custome compose deploy is used, exiting method"
        return
    }
    $packagesDir = $websiteDir + "\App_Data\packages"
    Write-Host "Current packages path is:"
    Write-Host $packagesDir
    # remove packages fron App_Data\packages
    if ((Test-Path -Path $packagesDir)) {
        Remove-Item $packagesDir -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $packagesDir
    Write-Host "Packages folder is created!" -ForegroundColor Green
}

function PatchTestConfiguration($actualTopologyInfo, $skipChDamPluginTestsDeployment, $skipGraphQLIntegrationTests, $skipExtensibilityTests, $newE2ETests, $useCustomComposeDeploy) {
    Print-FunctionInfo "$($MyInvocation.MyCommand)" $actualTopologyInfo

    $cmInstanceName = $actualTopologyInfo.managementInstanceName
    $hrzInstanceName = $actualTopologyInfo.hrzInstanceName
    $prcInstanceName = $actualTopologyInfo.procesingInstanceName
    $cmPhysicalPath = $actualTopologyInfo.managementInstancePhysicalPath
    $processingInstancePhysicalPath = $actualTopologyInfo.processingInstancePhysicalPath
    $collectionInstanceName = $actualTopologyInfo.collectionInstanceName
    $searchInstanceName = $actualTopologyInfo.searchInstanceName
    $originalInstanceName = $actualTopologyInfo.originalInstanceName
    $topology = $actualTopologyInfo.topology
    $deployedTestsLocation = $actualTopologyInfo.deployedTestsLocation
    $skipTestsDeployment = $actualTopologyInfo.skipTestsDeployment
    $damInstanceUrl = $actualTopologyInfo.damInstanceUrl

    Write-Host "PatchTestConfiguration:"
    Write-Host "cmPhysicalPath: $cmPhysicalPath"
    Write-Host "cmInstanceName: $cmInstanceName"
    Write-Host "hrzInstanceName: $hrzInstanceName"
    Write-Host "processingInstancePhysicalPath: $processingInstancePhysicalPath"
    Write-Host "deployedTestsLocation: $deployedTestsLocation"
    Write-Host "skipTestsDeployment: $skipTestsDeployment"
    Write-Host "newE2ETests: $newE2ETests"
    Write-Host "prcInstanceName: $prcInstanceName"

    $wrkDir = Join-Path $PSScriptRoot "deploy"

    $params = @{
        Path                           = Join-Path $wrkDir "Configs\tests.config.sif.config.json"
        InstanceName                   = $originalInstanceName
        CmInstanceName                 = $cmInstanceName
        HrzInstanceName                = $hrzInstanceName
        PrcInstanceName                = $prcInstanceName
        CmInstancePhysicalPath         = $cmPhysicalPath
        ProcessingInstancePhysicalPath = $processingInstancePhysicalPath
        CollectionInstanceName         = $collectionInstanceName
        SearchInstanceName             = $searchInstanceName
        Topology                       = $topology
        DeployedTestsLocation          = $deployedTestsLocation
        SkipChDamPluginTestsDeployment = $skipChDamPluginTestsDeployment
        ContentHubUrl                  = $damInstanceUrl
        SkipGraphQLIntegrationTests    = $skipGraphQLIntegrationTests
        SkipExtensibilityTests         = $skipExtensibilityTests
        NewE2ETests                    = $newE2ETests
        SkipTestsDeployment            = $skipTestsDeployment
        UseCustomComposeDeploy         = $useCustomComposeDeploy
    }
    Install-SitecoreConfiguration @params -WorkingDirectory $wrkDir
}

function Complete-PostRunTests {
    $actualTopologyInfo = GetActualTopologyInfo(@($args))
    $instanceName = $actualTopologyInfo.managementInstanceName

    $wrkDir = Join-Path $PSScriptRoot "deploy"

    $params = @{
        Path         = Join-Path $wrkDir "Configs\collect.logs.sif.config.json"
        InstanceName = $instanceName
        Topology     = $args.topology
    }
    Install-SitecoreConfiguration @params -WorkingDirectory $wrkDir
}

function GetMatchingChildItemPath($parentFolder, $itemPattern) {
    return Get-ChildItem $parentFolder | Where-Object { $_.Name -match "$itemPattern" } | Sort-Object | Select-Object -Last 1 | % { $_.FullName }
}

function Print-FunctionInfo($functionName, $argmts) {
    Write-Host -ForegroundColor cyan "## Override for $functionName with args: "
    $argmts | Format-List -force | Out-Host
}

function WarmUp-Instance {
    param(
        [Parameter(Mandatory = $true)][string] $instanceUrl
    )

    Write-Host "------------------ Warming up $instanceUrl ------------------"
    try {
        Invoke-WebRequest -Uri $instanceUrl -TimeoutSec 120
    }
    catch {
        Write-Host "Response from $instanceUrl was not successful"
    }
}

function InstallSxa {
    $baseFolder = Resolve-Path "$PSScriptRoot\..";
    $sxaInstallFolder = Join-Path $baseFolder "tmp\sxaInstall";
    $sxaDeployPackage = "\\mars\QA\Sitecore Experience Accelerator\Sitecore.XA.Deploy.zip"
    $actualTopologyInfo = GetActualTopologyInfo(@($args))
    $cmName = $actualTopologyInfo.managementInstanceName
    $cdName = $actualTopologyInfo.cdInstanceName

    Expand-Archive -Path $sxaDeployPackage -DestinationPath $sxaInstallFolder -Force
    & "$sxaInstallFolder\InstallModule.ps1" `
        -topology $args.topology `
        -prefix $args.instanceName `
        -instanceName $args.instanceName `
        -cmInstanceName $cmName `
        -cdInstanceName $cdName `
        -dbServer $args.dbServer `
        -dbUser $args.dbUser `
        -dbPass $args.dbPass `
        -solrPort $args.solrPort `
        -solrVersion $args.solrVersion `
        -nugetFeed $args.programNugetFeed
}

function InstallDamConnector {
    Write-Host "Installing Content Hub DAM connector..."
    $actualTopologyInfo = GetActualTopologyInfo(@($args))
    $cmName = $actualTopologyInfo.managementInstanceName
    $damInstanceUrl = $actualTopologyInfo.damInstanceUrl
    $contentSecurityPolicyValue = "default-src 'self' 'unsafe-inline' 'unsafe-eval' $damInstanceUrl; img-src 'self' data: $damInstanceUrl; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com $damInstanceUrl; font-src 'self' 'unsafe-inline' https://fonts.gstatic.com $damInstanceUrl; upgrade-insecure-requests; block-all-mixed-content;"
    $wrkDir = Join-Path $PSScriptRoot "deploy"
    $params = @{
        Path                       = Join-Path $wrkDir "Configs\dam.deploy.sif.config.json"
        CMInstanceName             = $cmName
        ContentSecurityPolicyValue = $contentSecurityPolicyValue
    }
    Write-Host "Running InstallDam, damInstanceUrl: $damInstanceUrl, cmName: $cmName, WorkingDirectory: $wrkDir" -ForegroundColor DarkCyan
    Install-SitecoreConfiguration @params -WorkingDirectory $wrkDir

    #login to sitecore ssc and set Content Hub provider URL in DAM Connector item
    $damConnectorItemId = "{15BE535E-1A49-4C91-A1CA-1DE14B35FF77}";
    Write-Host "Configuring ContentHub URL via SSC Rest API..."
    $postBody = @{domain = 'sitecore'; username = 'admin'; password = 'b' }
    $url = "https://$($cmName)/sitecore/api/ssc/auth/login"
    Invoke-WebRequest -Method POST -ContentType 'application/json' -Body (ConvertTo-Json $postBody) -Uri $url -SessionVariable websession -UseBasicParsing
    $url = "https://$($cmName)/sitecore/api/ssc/item/$($damConnectorItemId)?database=master"
    $patchBody = @{DAMInstance = $damInstanceUrl; SearchPage = "$damInstanceUrl/en-us/sitecore-dam-connect/approved-assets" }
    Invoke-WebRequest -Method PATCH -ContentType 'application/json' -Uri $url -Body (ConvertTo-Json $patchBody) -WebSession $websession -UseBasicParsing
    Write-Host "Installing Content Hub DAM connector has finished"
}

Function Complete-PostPackageInstallApiTests {
    param(
        [Parameter(Mandatory = $true)] $instanceNames

    )
    Write-Host "------------------ Configuring API Tests ------------------"

    # Set the environment variable CMUrl using the value from $instanceNames.cmInstanceUrl
    $cmUrl = $instanceNames.cmInstanceUrl

    Write-Host "CmUrl set to: $cmUrl"
    $env:CMUrl = $cmUrl

    Write-Host "CmUrl environment variable set to: $env:CMUrl"
    Write-Host "Configuring API Tests...Done"
}

