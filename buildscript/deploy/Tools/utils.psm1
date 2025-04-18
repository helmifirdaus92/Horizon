function Invoke-ToLowerConfigFunction {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$String
    )

    return $String.ToLowerInvariant()
}
Register-SitecoreInstallExtension -Command Invoke-ToLowerConfigFunction -As ToLower -Type ConfigFunction

function Invoke-InstallPackageTask {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [Parameter(Mandatory = $true)]
        [string]$SiteFolder,
        [Parameter(Mandatory = $true)]
        [string]$SiteUrl,
        [Parameter(Mandatory = $true)]
        [string]$PackagePath
    )

    Write-Information "Installing Package $PackagePath" -Tag 'PackageInstall'

    #Generate a random 10 digit folder name. For security
    $folderKey = -join ((97..122) | Get-Random -Count 10 | % { [char]$_ })

    #Generate a Access Key (hi there TDS)
    $accessKey = New-Guid

    Write-Information "Folder Key = $folderKey" -Tag 'PackageInstall'
    Write-Information "Access Guid = $accessKey" -Tag 'PackageInstall'

    #The path to the source Agent.  Should be in the same folder as I'm running
    $sourceAgentPath = "tools\PackageInstaller.asmx"

    #The folder on the Server where the Sitecore PackageInstaller folder is to be created
    $packageInstallPath = [IO.Path]::Combine($SiteFolder, 'sitecore', 'PackageInstaller')

    #The folder where the actuall install happens
    $destPath = [IO.Path]::Combine($SiteFolder, 'sitecore', 'PackageInstaller', $folderKey)

    #Full path including the installer name
    $fullFileDestPath = Join-Path $destPath "PackageInstaller.asmx"

    try {
        Write-Information "Source Agent [$sourceAgentPath]" -Tag 'PackageInstall'
        Write-Information "Dest AgentPath [$destPath]" -Tag 'PackageInstall'

        #Forcibly create the folder
        New-Item -ItemType Directory -Force -Path $destPath

        #Read contents of the file, and embed the security token
        (Get-Content $sourceAgentPath).replace('[TOKEN]', $accessKey) | Set-Content $fullFileDestPath

        #############################
        $pkgFolderPath = "$SiteFolder\App_Data\packages"
        Write-Host "Installing $packagePath to the Horizon instance"
        Write-Host "Copying the package locally"
        Copy-Item -LiteralPath "$packagePath" -Destination $pkgFolderPath
        $localPackagePath = [System.IO.Path]::GetFileName($packagePath)
        $localPackagePath = [System.IO.Path]::Combine($pkgFolderPath, $localPackagePath)
        Write-Host "The package was successfully copied to the $pkgFolderPath"
        Write-Host "Start installing package $localPackagePath..." -Program "Sitecore"
        #############################

        #How do we get to Sitecore? This URL!
        $webURI = "$siteURL/sitecore/PackageInstaller/$folderKey/packageinstaller.asmx?WSDL"

        Write-Information "Url $webURI" -Tag 'PackageInstall'

        #Do the install here
        $proxy = New-WebServiceProxy -uri $webURI
        $proxy.Timeout = 1800000

        #Invoke our proxy
        $proxy.InstallZipPackage($localPackagePath, $accessKey)
    }
    finally {
        #Remove the folderKey
        Remove-Item $packageInstallPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
