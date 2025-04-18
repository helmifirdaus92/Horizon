// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;

[assembly: SuppressMessage("Design", "CA1052:Static holder types should be Static or NotInheritable", Justification = "It is part of Sitecore.Framework.Runtime package and can't be changed in this project", Scope = "type", Target = "~T:Sitecore.Program")]
[assembly: SuppressMessage("Reliability", "CA2007:Do not directly await a Task", Justification = "It is part of Sitecore.Framework.Runtime package and can't be changed in this project", Scope = "member", Target = "~M:Sitecore.Program.Main(System.String[])~System.Threading.Tasks.Task{System.Int32}")]
