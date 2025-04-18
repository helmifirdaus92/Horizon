<%@ Page Language="c#" Inherits="System.Web.UI.Page" CodePage="65001" %>

<%@ OutputCache Location="None" VaryByParam="none" %>
<%@ Import Namespace="System.Security.Authentication" %>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">
    <title>Welcome to Sitecore</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="CODE_LANGUAGE" content="C#"/>
    <meta name="vs_defaultClientScript" content="JavaScript"/>
    <meta name="vs_targetSchema" content="http://schemas.microsoft.com/intellisense/ie5"/>
    <link href="/default.css" rel="stylesheet"/>
</head>
<body>
<div ID="IdContextUser" style="width:50%; margin:0 auto;">Context.User: <div style="color:red;display: inline-block;"><b> <%=Sitecore.Context.User.Name%></b></div></div>
<div ID="IdShellUser" style="width:50%; margin:0 auto;">Shell User: <div style="color:red;display: inline-block;"><b> <%=Sitecore.Publishing.PreviewManager.GetShellUser().Name%></b></div></div>
<div ID="IdDatabase" style="width:50%; margin:0 auto;">Database: <div style="color:red;display: inline-block;"><b> <%=Sitecore.Context.Database.Name%></b></div></div>
<div ID="IdSite" style="width:50%; margin:0 auto;">Site: <div style="color:red;display: inline-block;"><b> <%=Sitecore.Context.Site.Name%></b></div></div>
<div ID="IdDisplayMode" style="width:50%; margin:0 auto;">Display Mode: <div style="color:red;display: inline-block;"><b> <%=Sitecore.Context.Site.DisplayMode%></b></div></div> 
<form id="mainform" method="post" runat="server">    
    <div id="MainPanel">
        <sc:placeholder key="main" runat="server"/>
    </div>
    
	Username: <asp:TextBox ID="txtUsername" runat="server"></asp:TextBox> <br/>
	Password: <asp:TextBox ID="txtPassword" runat="server"></asp:TextBox><br/>
	<asp:Button ID="btnLogin" runat="server" Text="Login" /><br/>
	<asp:Button ID="btnLogout" runat="server" Text="Logout" OnClick="LogoutBtn_Click"  /><br/>
	Error Message:  <asp:Label ID="lblMessage" runat="server" ></asp:Label><br/>
	<br/>
	
	<script language="c#" runat="server">
        void LogoutBtn_Click(Object sender, EventArgs e)
	    {
	        Sitecore.Security.Authentication.AuthenticationManager.Logout();
	    }
        void Page_Load(object sender, EventArgs e)
	    {
	        btnLogout.Click += new EventHandler(LogoutBtn_Click);
	        if (IsPostBack)
	        {
	            if (String.IsNullOrEmpty(txtUsername.Text))
	            {
	                lblMessage.Text = "Invalid username.";
	            }
	            else if (String.IsNullOrEmpty(txtPassword.Text))
	            {
	                lblMessage.Text = "Invalid password.";
	            }
	            else
	            {
	                try
	                {
	                    Sitecore.Security.Domains.Domain domain = Sitecore.Context.Domain;
	                    string domainUser = domain.Name + @"\" + txtUsername.Text;
	                    if (Sitecore.Security.Authentication.AuthenticationManager.Login(domainUser,
	                        txtPassword.Text))
	                    {
	                    }
	                    else
	                    {
	                        throw new AuthenticationException(
	                            "Invalid username or password.");
	                    }
	                }
	                catch (AuthenticationException)
	                {
	                    lblMessage.Text = "Processing error.";
	                }
	            }
	        }
	    }
    </script>
</form>
</body>
</html>
