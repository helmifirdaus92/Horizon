# escape=`

ARG BASE_IMAGE

FROM ${BASE_IMAGE}

COPY .\featureIntegrationArtifacts\*\wwwroot C:\inetpub\wwwroot
COPY .\featureIntegrationArtifacts\bin\Sitecore.Horizon.Integration.dll C:\inetpub\wwwroot\bin
COPY .\featureIntegrationArtifacts\bin\Sitecore.Horizon.Integration.GraphQL.dll C:\inetpub\wwwroot\bin
COPY .\featureIntegrationArtifacts\bin\Sitecore.Horizon.Integration.GraphQL.xml C:\inetpub\wwwroot\bin
COPY .\featureIntegrationArtifacts\bin\Sitecore.Horizon.Integration.xml C:\inetpub\wwwroot\bin
COPY .\sxaConfig\App_Config C:\inetpub\wwwroot\App_Config
COPY .\hrzConfig\App_Config C:\inetpub\wwwroot\App_Config

RUN icacls 'C:\inetpub\wwwroot\layouts' /grant 'IIS_IUSRS:(F)' /t
RUN icacls 'C:\inetpub\wwwroot\xsl' /grant 'IIS_IUSRS:(F)' /t
