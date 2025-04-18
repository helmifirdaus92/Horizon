param(
    $configuration = "Release",
    $rootPath = (Split-Path $PSScriptRoot -Parent),
    $artifactsPath = (Join-Path $rootPath "artifacts"),
    $nugetFilter = "Sitecore.Horizon.Integration.*.nupkg",
    $excludeFilter = "*Tests*",
    $tempPath = (Join-Path $rootPath "tmp"),
    $toolsPath = (Join-Path $PSScriptRoot "tools"),
    $reportPath = (Join-Path $artifactsPath "IntegrationWhilteListCheckerReports"),
    $programVersion = (Get-Content -Path (Join-Path $PSScriptRoot "program.version"))
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

# make sure temp dir is there and it is empty
if (test-path $tempPath){
    rm $tempPath -Force -Recurse
}
mkdir $tempPath

# make sure report dir is there and it is empty
if (test-path $reportPath){
    rm $reportPath -Force -Recurse
}
mkdir $reportPath

# make sure whitelistchecker has been installed othrwise install it now
$whiteListCheckerPath = Join-Path "$toolsPath" "Sitecore.ThirdPartyWhitelistChecker"
if(!(test-path $whiteListCheckerPath )){
    Write-Host "the tools is not availble, try to install the latest version from nuget1dk1."
    nuget install Sitecore.ThirdPartyWhitelistChecker -x -Source http://nuget1dk1/nuget/Tools/ -outputdirectory $toolsPath
}

# make sure 'Check-Moduleswhitelist.ps1' and whitelist file itself are exist
$moduleWhitelistChecker = join-path "$whiteListCheckerPath" "tools\Check-Moduleswhitelist.ps1"
if (!(test-path $moduleWhitelistChecker)){
    throw "the file 'Check-Moduleswhitelist.ps1' is not exist in WhiteListChecker tool."
}
$whiteListFileName = "$programVersion"+"_whitelist.txt"
$whiteListFile = join-path "$whiteListCheckerPath" "tools\$whiteListFileName"
if (!(test-path $whiteListFile)){
    throw "the file '$whiteListFile' is not exist in WhiteListChecker tool."
}

# Unzip all artifacts packages and collect all dlls
$nupkgFiles = Get-ChildItem $artifactsPath -Filter $nugetFilter
foreach($file in $nupkgFiles){
    if(!($file -like $excludeFilter)){
        $folderName = [System.IO.Path]::GetFileNameWithoutExtension($file)
        $path = join-path $tempPath $folderName
        mkdir $path
        [System.IO.Compression.ZipFile]::ExtractToDirectory($file.FullName , $path)
        $dllFiles = Get-ChildItem $path -Filter "*.dll" -Recurse
        foreach($dllFile in $dllFiles){
            Copy-Item $dllFile.FullName -Destination $tempPath
        }
    }
}

$filter = [RegEx] "'^((?!Sitecore\.(?!(Framework|Nexus|XA|Commerce|Horizon)))).*\.dll$'"
$args = @()
$args += ('-folderPath', "$tempPath")
$args += ('-fileFilter', $filter)
$args += ('-whitelistFile', "$whiteListFile")
$args += ('-outputPath', "$reportPath")
$args += ('-whitelistFatal', "$false")

Write-Host "Command $moduleWhitelistChecker $args"
Invoke-Expression "$moduleWhitelistChecker $args"    

rm $tempPath -Force -Recurse
