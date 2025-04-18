Set-StrictMode -Version 2.0

Function Invoke-AddAlternativeSSLSiteBindingTask {
  param(
    [string] $SiteName,
    [string] $HostHeader,
    [string] $RootDnsName = 'Sitecore Install Framework'
  )
  
  [Security.Cryptography.X509Certificates.StoreLocation]$CertLocation = 'LocalMachine'
  $certificateLocation = "Cert:\$CertLocation\My"
  $rootCertificateLocation = "Cert:\$CertLocation\Root"

  $getRootCertParams = @{
      CertStorePath = $rootCertificateLocation
      ID = $RootDnsName
  }
  $rootCertificate = Invoke-GetCertificateConfigFunction @getRootCertParams


  Write-Verbose -Message "Creating signed certificate"

  $signedParams = @{
      Signer = $rootCertificate
      CertStoreLocation = $certificateLocation
      DnsName = $HostHeader
  }

  Invoke-NewSignedCertificateTask @signedParams

  $signedCertificate = Invoke-GetCertificateConfigFunction -ID $HostHeader -CertStorePath $certificateLocation

  $webBindingParams = @{
      Protocol   = 'https'
      Port       = 443
      Thumbprint = $signedCertificate.Thumbprint
      HostHeader = $HostHeader
      SSLFlags   = 1
  }
  
  Invoke-WebBindingTask -SiteName $SiteName -Add $webBindingParams
}

Register-SitecoreInstallExtension -Command Invoke-AddAlternativeSSLSiteBindingTask -As AddAlternativeSSLSiteBinding -Type Task