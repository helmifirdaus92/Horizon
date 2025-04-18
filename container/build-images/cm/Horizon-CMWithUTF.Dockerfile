# escape=`

ARG BASE_IMAGE

FROM ${BASE_IMAGE}

COPY .\featureIntegrationArtifacts\App_Config C:\inetpub\wwwroot\App_Config
COPY ["./featureIntegrationArtifacts/sitecore modules", "C:/inetpub/wwwroot/sitecore modules"]
COPY .\featureIntegrationArtifacts\sitecore\shell\horizon C:\inetpub\wwwroot\sitecore\shell\horizon
COPY .\featureIntegrationArtifacts\bin\Sitecore.Horizon.Integration.dll C:\inetpub\wwwroot\bin
COPY .\featureIntegrationArtifacts\bin\Sitecore.Horizon.Integration.GraphQL.dll C:\inetpub\wwwroot\bin
COPY .\featureIntegrationArtifacts\bin\Sitecore.Horizon.Integration.GraphQL.xml C:\inetpub\wwwroot\bin
COPY .\featureIntegrationArtifacts\bin\Sitecore.Horizon.Integration.xml C:\inetpub\wwwroot\bin
COPY .\sxaConfig\App_Config C:\inetpub\wwwroot\App_Config
COPY .\hrzConfig\App_Config C:\inetpub\wwwroot\App_Config


COPY .\utf\HelperWebService.asmx C:\inetpub\wwwroot\HelperWebService.asmx
COPY .\utf\UTF.HelperWebService.dll C:\inetpub\wwwroot\bin\UTF.HelperWebService.dll
COPY .\utf\proxy.asmx C:\inetpub\wwwroot\proxy.asmx
COPY .\utf\ps.ads.proxy.dll C:\inetpub\wwwroot\bin\ps.ads.proxy.dll

RUN icacls 'C:\inetpub\wwwroot\layouts' /grant 'IIS_IUSRS:(F)' /t
RUN icacls 'C:\inetpub\wwwroot\xsl' /grant 'IIS_IUSRS:(F)' /t

