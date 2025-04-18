<%@ Page Language="C#" AutoEventWireup="true"%>
<%@ Import namespace="Sitecore.Web"%>
<script runat="server">
  protected void Page_Load(object sender, EventArgs args)
  {
    if (!Sitecore.Context.User.IsAuthenticated)
    {
      WebUtil.RedirectToLoginPage();
    }
  }
</script>  
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<script>
  if (window.parent) {
    window.parent.postMessage('hrzEmptyPageLoaded', '*');
  }
</script>
  Empty Page
</body>
</html>
