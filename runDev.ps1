$ClientProjects = @(
    [PSCustomObject] @{
        Name = "Horizon.Client";
        Path = "src/Sitecore.Horizon.Client/Client";
        DevBuild = "build:dev";
        ProdBuild = "build";
    }
    [PSCustomObject] @{
        Name = "Horizon.Canvas.Client";
        Path = "src/Sitecore.Horizon.Canvas.Client/Client";
        DevBuild = "build:dev";
        ProdBuild = "build";
    }
)
$IntegrationProjects = @(
    [PSCustomObject] @{
        Name="Horizon.Integration";
        Path="src/Sitecore.Horizon.Integration";
        AssemblyName="Sitecore.Horizon.Integration";
    }
    [PSCustomObject] @{
        Name="Horizon.Integration.GraphQL";
        Path="src/Sitecore.Horizon.Integration.GraphQL";
        AssemblyName="Sitecore.Horizon.Integration.GraphQL";
    }
    [PSCustomObject] @{
        Name="Horizon.Integration.Insights";
        Path="src/Sitecore.Horizon.Integration.Insights";
        AssemblyName="Sitecore.Horizon.Integration.Insights";
    }
)

$ClientGqlSchemaUpdaterPath = "src\Sitecore.Horizon.Client\Client\schema\updateSchema.js"
$AuthoringHostProjectPath = "src\Sitecore.Horizon.Host\Sitecore.Horizon.Host.csproj"
$PlatformFolderPath = "C:\inetpub\wwwroot\horizon"
$PlatformIdentityFolderPath = "C:\inetpub\wwwroot\horizon-IdentityServer"

function PromptOption {
    while($true) {
        Write-Host
        Write-Host -ForegroundColor DarkYellow @"
Select task:

-========== Misc ===========-
q  - exit
c  - Clean up BE projects
us - Update client GQL schema
r  - Set cloudsmith credentials 
     (console restrart is required after the first run)
cn - Clean node_module folders

-========== Setup ===========-
p/pp - setup platform/xmcloud dev environment
0 - setup client projects

-=========== Platform ===========-
d - Copy DEBUG artifacts [dll|pdb]
o - Copy config files [config]

-=========== Authoring Host ===========-
1/11 - Build client [DEV/PROD]
2    - Watch dev host
3/33 - Watch dev host + build client [DEV/PROD]
4    - Watch dev host + watch client

"@
        Write-Host "Enter your choice: " -NoNewLine
        $task = Read-Host

        Write-Host

        switch ($task) {
            "q" { return }
            "0" {
                Task-InstallAndExportDevCertificate
                Task-InstallNpmClientProjects
            }
            "1" {
                Task-BuildClientProjects "DEV"
            }
            "11" {
                Task-BuildClientProjects "PROD"
            }
            "2" {
                Task-RunDevHost $AuthoringHostProjectPath "DevHost.PrebuiltClient"
                return
            }
            "3" {
                Task-BuildClientProjects "DEV"
                Task-RunDevHost $AuthoringHostProjectPath "DevHost.PrebuiltClient"
                return
            }
            "33" {
                Task-BuildClientProjects "PROD"
                Task-RunDevHost $AuthoringHostProjectPath "DevHost.PrebuiltClient"
                return
            }
            "4" {
                Task-RunDevHost $AuthoringHostProjectPath "DevHost.LiveClient"
                return
            }
            "us" {
                Task-UpdateClientGqlSchema
            }
            "c" {
                Task-CleanBackendProjects
            }
            "p" {
                Task-ConfigurePlatformDevEnvironment
            }
            "pp" {
                Task-ConfigureXMCloudDevEnvironment
            }
            "d" {
                Task-CopyDevArtifactsToPlatform
            }
            "o" {
                Task-CopyConfigurationToPlatform
            }
            "r" {
                Task-SetCloudsmithCredentials
            }
            "cn" {
                Write-Host "Start deleting 'node_modules' folders" -ForegroundColor Yellow
                Delete-NodeModulesFolders (Get-Location).Path + '\src'
                Write-Host "Successfully deleted 'node_modules' folders" -ForegroundColor Yellow
            }
            default {
                Write-Host "Wrong choice: $task" -ForegroundColor Red
            }
        }

    }
}

function Task-InstallNpmClientProjects {
    Write-Host
    Write-Host "Installing NPM packages for client projects" -ForegroundColor Green
    Write-Host "--------------------"

    foreach ($proj in $ClientProjects) {
        Write-Host
        Write-Host "Installing $($proj.Name)" -ForegroundColor Yellow
        $absolutePath = (Resolve-Path $proj.Path).Path
        Start-Process -FilePath "npm" -ArgumentList "install" -WorkingDirectory $absolutePath -NoNewWindow -Wait
    }
}

function Task-InstallAndExportDevCertificate {
    Write-Host
    Write-Host "Installing and exporting dev certificate" -ForegroundColor Green
    Write-Host "--------------------"

    Write-Host
    Start-Process -FilePath "dotnet" -ArgumentList "dev-certs https --trust --export-path dev-cert.pfx --password 12345" -NoNewWindow -Wait
    Write-Host
    Write-Host "Successfully exported certificate to dev-cert.pfx" -ForegroundColor Yellow
}

# Function to recursively search for and delete 'node_modules' folders
function Delete-NodeModulesFolders($rootPath) {
    Get-ChildItem -Path $rootPath -Directory | ForEach-Object {
        if ($_.Name -eq 'node_modules') {
            Delete-NodeModulesFolder -folderPath $_.FullName
        }
        else {
            Delete-NodeModulesFolders -rootPath $_.FullName
        }
    }
}

function Delete-NodeModulesFolder($folderPath) {
    if (Test-Path -Path $folderPath -PathType Container) {
        Write-Host "Deleting 'node_modules' folder in $folderPath"
        Remove-Item -Path $folderPath -Recurse -Force
    }
}

# recursively search for .npmrc files and replace tokens
function Task-SetCloudsmithCredentials {
$rootPath = (Get-Location).Path

$cloudsmithUserName = Read-Host "Enter the Cloudsmith user name"
$cloudsmithApiToken = Read-Host "Enter the Cloudsmith API token"

    # nuget
    [Environment]::SetEnvironmentVariable('CLOUDSMITH_USERNAME', $cloudsmithUserName, 'Machine')
    [Environment]::SetEnvironmentVariable('CLOUDSMITH_APIKEY', $cloudsmithApiToken, 'Machine')

    # npm
    Get-ChildItem -Path $rootPath -Recurse -Filter ".npmrc" | ForEach-Object {
        Replace-CloudSmithApiToken -file $_.FullName -cloudsmithToken $cloudsmithApiToken
        Uncomment-NpmrcLines -file $_.FullName
    }
}

function Replace-CloudSmithApiToken($file, $cloudsmithToken) {
    $fileContent = Get-Content -Path $file -Raw
    $newContent = $fileContent -replace '\${cloudSmithApiToken\}', $cloudsmithToken

    if ($newContent -ne $fileContent) {
        Write-Host "Replacing '{cloudSmithApiToken}' with '$cloudsmithToken' in $file"
        Set-Content -Path $file -Value $newContent
    }
}

function Uncomment-NpmrcLines($file) {
    $fileContent = Get-Content -Path $file
    $newContent = $fileContent | ForEach-Object {
        $_ -replace '^#', ''
    }

    if ($newContent -ne $fileContent) {
        Write-Host "Uncommented specified lines in $file"
        Set-Content -Path $file -Value $newContent
    }
}

function Task-BuildClientProjects ($config) {
    Write-Host
    Write-Host "Building client projects [$config]" -ForegroundColor Green
    Write-Host "--------------------"

    foreach ($proj in $ClientProjects) {
        Write-Host
        Write-Host "Building $($proj.Name) in $config mode" -ForegroundColor Yellow
        $absolutePath = (Resolve-Path $proj.Path).Path
        $scriptName = if ($config -eq "dev") { $proj.DevBuild } else { $proj.ProdBuild }
        Start-Process -FilePath "npm" -ArgumentList "run $scriptName" -WorkingDirectory $absolutePath -NoNewWindow -Wait
    }
}

function Task-RunDevHost ($path, $launchProfile) {
    Write-Host
    Write-Host "Running Dev Host" -ForegroundColor Green
    Write-Host "--------------------"
    Write-Host "HINT:" -ForegroundColor DarkCyan
    Write-Host "Press 'Ctrl + C' twice to stop the dev host" -ForegroundColor DarkCyan

    Start-Process -FilePath "dotnet" -ArgumentList "watch -v --project $path run --launch-profile $launchProfile" -NoNewWindow -Wait
}

function Task-UpdateClientGqlSchema {
    Write-Host
    Write-Host "Updating client GQL schema" -ForegroundColor Green
    Write-Host "--------------------"
    Write-Host

    Start-Process -FilePath "node" -ArgumentList $ClientGqlSchemaUpdaterPath -NoNewWindow -Wait

    Write-Host
    Write-Host "Updated client GQL schema" -ForegroundColor Green
}

function Task-CleanBackendProjects {
    Write-Host
    Write-Host "Cleaning up back-end projects" -ForegroundColor Green
    Write-Host "--------------------"
    Write-Host

    $paths = $("src/*/obj", "src/*/bin", "tests/*/obj", "tests/*/bin")

    foreach ($path in $paths) {
        Get-ChildItem -Path $path | Remove-Item -Recurse
        Write-Host "Cleaned up: $path" -ForegroundColor Yellow
    }

    Write-Host
    Write-Host "Successfully cleaned up all BE projects" -ForegroundColor Green
}

function Task-ConfigurePlatformDevEnvironment {
    Write-Host
    Write-Host "Configuring platform for local development" -ForegroundColor Green
    Write-Host "--------------------"
    Write-Host

    $xml = New-Object XML
    $horizonIntegrationFile = "$PlatformFolderPath\App_Config\Modules\Horizon\Sitecore.Horizon.Integration.config"
    $horizonGqlConfigFile = "$PlatformFolderPath\App_Config\Modules\Horizon\Sitecore.Horizon.Integration.GraphQL.config"
    $sisHostFile = "$PlatformIdentityFolderPath\Config\production\Sitecore.IdentityServer.Host.xml"
    $webconfigFile = "$PlatformFolderPath\web.config"
    $horizonHttpUrl = "http://localhost:5000"
    $horizonHttpsUrl = "https://localhost:5001"

    #
    # *************** Horizon Integration ***************
    #
    $xml.Load($horizonIntegrationFile)

    $horizonClientHostElement = $xml.SelectSingleNode("/configuration/sitecore/settings/setting[@name='Horizon.ClientHost']")
    $horizonClientHostElement.SetAttribute("value", $horizonHttpsUrl);

    $xml.Save($horizonIntegrationFile)
    Write-Host "Patched $horizonIntegrationFile" -ForegroundColor Yellow

    #
    # *************** Horizon GraphQL Integration ***************
    #
    $xml.Load($horizonGqlConfigFile)

    $detailedErrorElement = $xml.SelectSingleNode("/configuration/sitecore/settings/setting[@name='Horizon.GraphQL.ShowDetailedErrors']")
    $detailedErrorElement.SetAttribute("value", "true")

    $xml.Save($horizonGqlConfigFile)
    Write-Host "Patched $horizonGqlConfigFile" -ForegroundColor Yellow

    #
    # *************** IdentityServer ***************
    #
    $xml.Load($sisHostFile)

    $element = $xml.SelectSingleNode("//AllowedCorsOriginsGroup1")
    $element.InnerText = $element.InnerText + "|$horizonHttpUrl|$horizonHttpsUrl"

    $xml.Save($sisHostFile)
    Write-Host "Patched $sisHostFile" -ForegroundColor Yellow

    #
    # *************** Web.config ***************
    #
    $xml.Load($webconfigFile)
    $systemWebElement = $xml.SelectSingleNode("/configuration/system.web")

    $sessionElement = $systemWebElement.SelectSingleNode("sessionState")
    $sessionElement.SetAttribute("cookieSameSite", "None")

    $httpCookiesElement = $systemWebElement.SelectSingleNode("httpCookies")
    if(!$httpCookiesElement) {
        $httpCookiesElement = $xml.CreateElement("httpCookies")
        $systemWebElement.AppendChild($httpCookiesElement) | Out-Null
    }
    $httpCookiesElement.SetAttribute("sameSite", "None")
    $httpCookiesElement.SetAttribute("requireSSL", "true")

    $xml.Save($webconfigFile)
    Write-Host "Patched $webconfigFile" -ForegroundColor Yellow


    Write-Host
    Write-Host "Config files for Horizon have been patched." -ForegroundColor Yellow


    #
    # *************** Restart IIS ***************
    #
    Write-Host
    Write-Host "Restarting IIS..." -ForegroundColor Yellow
    iisreset

    Write-Host
    Write-Host "Restarting IIS one more time just to be sure..." -ForegroundColor Yellow
    iisreset

    Write-Host
    Write-Host "IIS restarted" -ForegroundColor Yellow

    Write-Host
    Write-Host "Successfully configured platform" -ForegroundColor Green
}

function Task-ConfigureXMCloudDevEnvironment {
    Write-Host
    Write-Host "Configuring XMCloud for local development"
    Write-Host "--------------------"
    Write-Host

    Push-Location ".\container\deploy\runspace"
    Write-Host "Stopping containers...."
    docker-compose down

    $localhost = "localhost:5000"
    Write-Host "Setting SITECORE_Pages_Client_Host envirinment variable to $localhost"
    Write-Host "Setting SITECORE_Pages_CORS_Allowed_Origins envirinment variable to $localhost"
    $envFile = ".\.env"
    $envVars = ConvertFrom-StringData (Get-Content "$envFile" -Raw)
    $envVars.SITECORE_Pages_Client_Host = $localhost
    $envVars.SITECORE_Pages_Client_URL_Protocol = "http://"
    $envVars.SITECORE_Pages_CORS_Allowed_Origins = "http://$localhost"
    $envVars.SITECORE_GRAPHQL_CORS = "http://$localhost"
    $envVars.GetEnumerator() | ForEach-Object { "$($_.Name)=$($_.Value)" } | Out-String | Out-File $envFile -Encoding default

    Write-Host "Starting containers...."
    docker-compose up -d
    Pop-Location

    Write-Host
    Write-Host "Successfully configured XMCloud for local development" -ForegroundColor Green
}

function Task-CopyDevArtifactsToPlatform {
    Write-Host
    Write-Host "Copying DEBUG artifacts to platform" -ForegroundColor Green
    Write-Host "--------------------"
    Write-Host

    $scInstanceBinPath = Join-Path $PlatformFolderPath "bin"
    $BuildConfig = "Debug"

    foreach ($proj in $IntegrationProjects) {
        $pathToAssemblyNoExt = [IO.Path]::Combine($proj.Path, "bin", $BuildConfig, $proj.AssemblyName)

        Copy-Item -Path "$pathToAssemblyNoExt.dll" -Destination $scInstanceBinPath -Force
        Copy-Item -Path "$pathToAssemblyNoExt.pdb" -Destination $scInstanceBinPath -Force
        Write-Host "File copied: $pathToAssemblyNoExt.[dll, pdb]" -ForegroundColor Yellow
    }

    Write-Host
    Write-Host "Successfully copied!" -ForegroundColor Green
}
function Task-CopyConfigurationToPlatform {
    Write-Host
    Write-Host "Copying cofiguration files to platform" -ForegroundColor Green
    Write-Host "--------------------"
    Write-Host

    $scInstanceAppConfigPath = Join-Path $PlatformFolderPath "App_Config"

    foreach ($proj in $IntegrationProjects) {
        $pathToAppConfig = Join-Path $proj.Path "App_Config"

        if(-Not (Test-Path $pathToAppConfig)) {
            Write-Host "Skipping project $($proj.Name) as it doesn't contain config files" -ForegroundColor Gray
            continue;
        }

        Push-Location $pathToAppConfig

        $configFiles = Get-ChildItem -Path "." -Name
        foreach ($fileOrFolderPath in $configFiles) {
            Copy-Item -Path $fileOrFolderPath -Destination $scInstanceAppConfigPath -Container -Recurse -Force
            Write-Host "Config copied: $pathToAppConfig\$fileOrFolderPath" -ForegroundColor Yellow
        }

        Pop-Location
    }

    Write-Host
    Write-Host "Successfully copied configuration!" -ForegroundColor Green
}

PromptOption
