<%@ WebService Language="C#" Class="PackageInstaller" %>
using System;
using Sitecore;
using Sitecore.Diagnostics;
using Sitecore.Install;
using Sitecore.Install.Framework;
using Sitecore.Install.Metadata;
using Sitecore.Install.Zip;
using Sitecore.Security.Accounts;
using Sitecore.SecurityModel;
using Sitecore.Configuration;
using Sitecore.Install.Files;
using Sitecore.Install.Items;
using Sitecore.Install.Utils;
using System.Web.Services;

/// <summary>
/// Summary description for UpdatePackageInstaller
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.ComponentModel.ToolboxItem(false)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line.
// [System.Web.Script.Services.ScriptService]
public class PackageInstaller : System.Web.Services.WebService
{
  /// <summary>
  /// Installs a Sitecore Zip Package.
  /// </summary>
  /// <param name="path">A path to a package that is reachable by the web server</param>
  [WebMethod(Description = "Installs a Sitecore Zip Package.")]
  public void InstallZipPackage(string packagePath, string token)
  {
	  if(string.IsNullOrEmpty(token))
		  return;
	  if(token != "[TOKEN]")
		  return;

    try
      {
        using (new SecurityDisabler())
        {
          using (new UserSwitcher("sitecore\\admin", true))
          {
            using (ConfigWatcher.PostponeEvents())
            {
              var installer = new Installer();
              IProcessingContext context = new SimpleProcessingContext();
                IItemInstallerEvents instance1 = new DefaultItemInstallerEvents(new BehaviourOptions(InstallMode.Overwrite, MergeMode.Undefined));
                context.AddAspect(instance1);
                IFileInstallerEvents instance2 = new DefaultFileInstallerEvents(true);
                context.AddAspect(instance2);
                installer.InstallPackage(packagePath, context);
              installer.InstallSecurity(packagePath);

              Log.Info("Installing post step...", string.Empty);
              DoRunPostStep(installer, packagePath);
            }
          }
        }
      }
      catch (System.Threading.ThreadAbortException ex)
      {
        Log.Error("Exception " + ex.GetType().FullName, ex, string.Empty);
      }
      catch (Exception ex)
      {
        Log.Error("Failed to install package " + packagePath, ex, string.Empty);
        Log.Error("Exception " + ex.GetType().FullName, ex, string.Empty);
        throw ex;
      }
  }

  /// <summary>
  /// Do run post step.
  /// </summary>
  /// <param name="installer">
  /// Installer.
  /// </param>
  /// <param name="path">
  /// Package path.
  /// </param>
  private static void DoRunPostStep(Installer installer, string path)
  {
    IProcessingContext context = Installer.CreateInstallationContext();
    ISource<PackageEntry> source = new PackageReader(path);

    var view = new MetadataView(context);
    var sink = new MetadataSink(view);

    sink.Initialize(context);
    source.Populate(sink);

    installer.ExecutePostStep(view.PostStep, context);
  }
}
