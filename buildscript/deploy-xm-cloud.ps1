# Set strict mode to error on uninitialized variables
Set-StrictMode -Version Latest

# Export variables
# $clientId = "2bU100d0RUQ2hjHp43k7XJNe0OvprtYs"
# $clientSecret = "87MTAp_2R9PNp9Exu9wIyUuLV7KJhDBe2g44akQd_XXnTdyhpTMCmcora0RIdVvV"
# $audience = "https://api-staging.sitecore-staging.cloud"
# $auth = "https://auth-staging-1.sitecore-staging.cloud"
# $xmCloudDeployEndpoint = "https://xmclouddeploy-api-staging.sitecore-staging.cloud"
# $persistentTestProjectName = "Pages-CI-QA"
# $persistentTestEnv = "pages-ci-qa"

$clientId = $env:Org_ClientId
$clientSecret = $env:Org_ClientSecret
$audience = $env:Auth0_Audience
$auth = $env:Auth0_Auth
$xmCloudDeployEndpoint = $env:XmCloudDeployEndpoint

$persistentTestProjectName = if ($env:ProjectName) { $env:ProjectName } else { "Pages-CI-QA" }
$persistentTestEnv = if ($env:EnvironmentName) { $env:EnvironmentName } else { "pages-ci-qa" }

function InstallIfEnvironmentDoesNotExist {
    param (
        [string]$ProjectName,
        [string]$Env
    )

    Write-Host "Starting InstallIfEnvironmentDoesNotExist for ProjectName: $ProjectName, Env: $Env"

    $ProjectListJson = & dotnet sitecore cloud project list --json
    Write-Host "Project List JSON: $ProjectListJson"
    $ProjectList = $ProjectListJson | ConvertFrom-Json
    $ProjectId = ($ProjectList | Where-Object { $_.name -eq $ProjectName }).id

    if (-not $ProjectId) {
        Write-Host "Project does not exist. Creating project with name $ProjectName."
        $OutputProjectJson = & dotnet sitecore cloud project create --name $ProjectName --json
        $OutputProject = $OutputProjectJson | ConvertFrom-Json
        $ProjectId = $OutputProject.id
    }

    Write-Host "ProjectId: $ProjectId"

    $EnvListJson = & dotnet sitecore cloud environment list --project-id $ProjectId --json
    $EnvList = $EnvListJson | ConvertFrom-Json
    $ExistingEnv = $EnvList | Where-Object { $_.name -eq $Env }

    if ($ExistingEnv) {
        $EnvironmentId = $ExistingEnv.id
        Write-Host "Environment '$Env' exists. Deleting environment with id $EnvironmentId..."
        & dotnet sitecore cloud environment delete --environment-id $EnvironmentId --force
    }

    Write-Host "Creating environment with name '$Env'..."
    $OutputEnvJson = & dotnet sitecore cloud environment create --project-id $ProjectId --name $Env --json
    $OutputEnv = $OutputEnvJson | ConvertFrom-Json
    $EnvironmentId = $OutputEnv.id

    Write-Host "Deploying to environment: $Env"
    dotnet sitecore cloud deployment create --environment-id $EnvironmentId --upload --working-dir .

    Write-Host "Completed InstallIfEnvironmentDoesNotExist for ProjectName: $ProjectName, Env: $Env"
}

function Copy-ConfigFolder {
    Write-Host "Starting Copy-ConfigFolder"

    $SourcePath = ".\..\..\container\build-images\xmcloud\hrzConfig\App_Config\Modules\Horizon"
    $DestinationPath = "authoring\platform\App_Config\Include"
    Write-Host "$SourcePath -> $DestinationPath"

    if (-Not (Test-Path $SourcePath)) {
        Write-Error "Source path '$SourcePath' does not exist."
        return
    }

    if (-Not (Test-Path $DestinationPath)) {
        New-Item -ItemType Directory -Path $DestinationPath -Force
    }

    Copy-Item -Path $SourcePath -Destination $DestinationPath -Recurse -Force

    Write-Host "Completed Copy-ConfigFolder"
}

function Copy-CustomComponent {
    Write-Host "Starting Copy-CustomComponent"

    $CustomComponentPath = ".\..\..\container\build-images\jsshost\CustomComponent.tsx"
    $CustomComponentPageContentPath = ".\..\..\container\build-images\jsshost\CustomComponentPageContent.tsx"
    $DestinationPath = "headapps\nextjs-starter\src\components"

    Write-Host "$CustomComponentPath -> $DestinationPath"
    Write-Host "$CustomComponentPageContentPath -> $DestinationPath"

    if (-Not (Test-Path $CustomComponentPath)) {
        Write-Error "Source file path '$CustomComponentPath' does not exist."
        return
    }
    if (-Not (Test-Path $CustomComponentPageContentPath)) {
        Write-Error "Source file path '$CustomComponentPageContentPath' does not exist."
        return
    }

    if (-Not (Test-Path $DestinationPath)) {
        New-Item -ItemType Directory -Path $DestinationPath -Force
    }

    Copy-Item -Path $CustomComponentPath -Destination $DestinationPath -Force
    Copy-Item -Path $CustomComponentPageContentPath -Destination $DestinationPath -Force

    Write-Host "Completed Copy-CustomComponent"
}

function Copy-Serialization {
    Write-Host "Starting Copy-Serialization"

    $SourceFolderPath = ".\..\..\container\deploy\sxa-starter\serialization\sitecore"
    $DestinationFolderPath = "authoring\items"
    $SitecoreDestinationFolderPath = "$DestinationFolderPath\sitecore"

    Write-Host "$SourceFolderPath -> $SitecoreDestinationFolderPath"

    if (-Not (Test-Path $SourceFolderPath)) {
        Write-Error "Source folder path '$SourceFolderPath' does not exist."
        return
    }

    if (-Not (Test-Path $SitecoreDestinationFolderPath)) {
        New-Item -ItemType Directory -Path $SitecoreDestinationFolderPath -Force
    }

    Copy-Item -Path "$SourceFolderPath\*" -Destination $SitecoreDestinationFolderPath -Recurse -Force

    # Copy all *.module.json files
    $ModuleJsonFiles = Get-ChildItem -Path ".\..\..\container\deploy\sxa-starter\serialization" -Filter *.module.json
    foreach ($File in $ModuleJsonFiles) {
        if ($File.Name -notmatch "^renderinghost") {
            $DestinationFilePath = Join-Path -Path $DestinationFolderPath -ChildPath $File.Name
            Copy-Item -Path $File.FullName -Destination $DestinationFilePath -Force

            # Update $schema in the copied file
            (Get-Content -Path $DestinationFilePath) -replace '"\$schema":\s*".*?"', '"$schema": "../../.sitecore/schemas/ModuleFile.schema.json"' | Set-Content -Path $DestinationFilePath
        }
    }

    Write-Host "Completed Copy-Serialization"
}

function Update-Csproj {
    Write-Host "Starting Update-Csproj"

    $RelativePath = "authoring\platform\Platform.csproj"
    $CsprojPath = Resolve-Path $RelativePath

    if (-not (Test-Path $CsprojPath)) {
        Write-Host "Error: .csproj file not found at $CsprojPath"
        return
    }

    [xml]$Csproj = Get-Content $CsprojPath
    Write-Host "start update .csproj content:"

    $NamespaceURI = $Csproj.Project.NamespaceURI
    $NewItemGroup = $Csproj.CreateElement("ItemGroup", $NamespaceURI)
    $ContentElement = $Csproj.CreateElement("Content", $NamespaceURI)
    $ContentElement.SetAttribute("Include", "App_Config\Include\Horizon\Sitecore.Horizon.E2ETest.Patches.config")
    $NewItemGroup.AppendChild($ContentElement) | Out-Null
    $Csproj.Project.AppendChild($NewItemGroup) | Out-Null

    $Csproj.Save($CsprojPath)
    Write-Host "Updated .csproj content:"
    Write-Output "The .csproj file has been updated successfully."

    Write-Host "Completed Update-Csproj"
}

function Initialize-SitecoreCli {
    Write-Host "Starting Initialize-SitecoreCli"

    $DotnetToolConfigFolder = ".config"
    $DotnetToolCacheFolder = "~\.dotnet\toolResolverCache\1"

    if (Test-Path $DotnetToolConfigFolder) {
        Remove-Item $DotnetToolConfigFolder -Force -Recurse
    }

    if (Test-Path $DotnetToolCacheFolder) {
        Push-Location $DotnetToolCacheFolder
        Remove-Item "sitecore.cli" -Force -Erroraction SilentlyContinue
        Pop-Location
    }

    dotnet new tool-manifest --force
    dotnet tool install Sitecore.CLI --version "5.*" --ignore-failed-sources
    dotnet tool restore
    Start-Sleep -Seconds 5
    dotnet sitecore init
    dotnet sitecore plugin init --overwrite

    Write-Host "Completed Initialize-SitecoreCli"
}

Write-Host "Running deployment script"

$Url = "https://github.com/sitecorelabs/xmcloud-foundation-head-staging.git"
$Dir = "./xmcloud-foundation-head-staging"

if (-Not (Test-Path $Dir)) {
    Write-Host "Cloning repository from $Url"
    git clone $Url
}

Set-Location $Dir

Copy-ConfigFolder

Copy-CustomComponent

Copy-Serialization

Update-Csproj

Initialize-SitecoreCli

Write-Host "Logging into Sitecore Cloud"
dotnet sitecore cloud login --client-credentials true --client-id $clientId --client-secret $clientSecret --audience $audience --authority $auth --xmcloudhost $xmCloudDeployEndpoint

InstallIfEnvironmentDoesNotExist -ProjectName $persistentTestProjectName -Env $persistentTestEnv

Write-Host "Deployment script completed"
