// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.Save;
using Xunit;
using ConvertLayoutField = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.ConvertLayoutField;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class ConvertLayoutFieldTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldNotResetIfValueWasChanged(
            [Frozen] BaseItemManager itemManager,
            ConvertLayoutField sut)
        {
            // arrange
            //different layout values
            string originalValue = @"<r xmlns:xsd=""http://www.w3.org/2001/XMLSchema""><d id=""{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}"" l=""{14030E9F-CE92-49C6-AD87-7D49B50E42EA}"">
                              <r ds="""" id=""{493B3A83-0FA7-4484-8FC9-4680991CF743}"" par="""" ph=""/main/centercolumn/content"" uid=""{B343725A-3A93-446E-A9C8-3A2CBD3DB489}"">
                              </r>
                              </d><d id=""{46D2F427-4CE5-4E1F-BA10-EF3636F43534}"" l=""{14030E9F-CE92-49C6-AD87-7D49B50E42EA}"">
                              <r ds="""" id=""{493B3A83-0FA7-4484-8FC9-4680991CF743}"" par="""" ph=""content"" uid=""{A08C9132-DBD1-474F-A2CA-6CA26A4AA650}"" /></d></r>";

            string newLayout = @"<r xmlns:xsd=""http://www.w3.org/2001/XMLSchema""><d id=""{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}"" l=""{14030E9F-CE92-49C6-AD87-7D49B50E42EA}"">
                              <r ds="""" id=""{885B8314-7D8C-4CBB-8000-01421EA8F406}"" par="""" ph=""main"" uid=""{43222D12-08C9-453B-AE96-D406EBB95126}"" />
                              <r ds="""" id=""{CE4ADCFB-7990-4980-83FB-A00C1E3673DB}"" par="""" ph=""/main/centercolumn"" uid=""{CF044AD9-0332-407A-ABDE-587214A2C808}"" />
                              <r ds="""" id=""{493B3A83-0FA7-4484-8FC9-4680991CF743}"" par="""" ph=""/main/centercolumn/content"" uid=""{B343725A-3A93-446E-A9C8-3A2CBD3DB489}"">
                                <rls>  <ruleset>  <rule name=""Hide"" uid=""{7DAB5F53-266A-4412-B28E-83E6B0F6128D}"">  <actions>
                                <action id=""{25F351A1-712D-45F8-857D-8AD95BB2ACE9}"" uid=""BD38CF4BFA31473886E84F4407887049"" />  </actions>
                                </rule>  <rule uid=""{00000000-0000-0000-0000-000000000000}"" name=""Default"">  <conditions>
                                <condition id=""{4888ABBB-F17D-4485-B14B-842413F88732}"" uid=""A76F1DF24376412B8F5F1B6F3F78F842"" />
                                </conditions>  <actions />  </rule>  </ruleset>  </rls>
                              </r>
                              </d><d id=""{46D2F427-4CE5-4E1F-BA10-EF3636F43534}"" l=""{14030E9F-CE92-49C6-AD87-7D49B50E42EA}"">
                              <r ds="""" id=""{493B3A83-0FA7-4484-8FC9-4680991CF743}"" par="""" ph=""content"" uid=""{A08C9132-DBD1-474F-A2CA-6CA26A4AA650}"" /></d></r>";

            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            var fieldId = ID.NewID;
            var field = Substitute.For<Field>(fieldId, item);
            field.Value.Returns(originalValue);
            field.Type.Returns("layout");
            item.Fields.Returns(Substitute.For<FieldCollection>(item));
            item.Fields[fieldId].Returns(field);

            itemManager.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).Returns(item);

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID,
                    Fields = new List<HorizonArgsSaveField>()
                    {
                        new HorizonArgsSaveField()
                        {
                            ID = fieldId,
                            Value = newLayout
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            Assert.NotEqual(args.Items[0].Fields[0].Value, originalValue);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldResetIfValueWasNotChanged(
            [Frozen] ISitecoreContext context,
            ConvertLayoutField sut)
        {
            // arrange
            //different string values but same xmls
            string originalValue = @"<r xmlns:xsd=""http://www.w3.org/2001/XMLSchema""><d id=""{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}"" l=""{14030E9F-CE92-49C6-AD87-7D49B50E42EA}"">
                              <r ds="""" id=""{885B8314-7D8C-4CBB-8000-01421EA8F406}"" par="""" ph=""main"" uid=""{43222D12-08C9-453B-AE96-D406EBB95126}"" />
                              <r ds="""" id=""{CE4ADCFB-7990-4980-83FB-A00C1E3673DB}"" par="""" ph=""/main/centercolumn"" uid=""{CF044AD9-0332-407A-ABDE-587214A2C808}"" />
                              <r ds="""" id=""{493B3A83-0FA7-4484-8FC9-4680991CF743}"" par="""" ph=""/main/centercolumn/content"" uid=""{B343725A-3A93-446E-A9C8-3A2CBD3DB489}"">
                                <rls>  <ruleset>  <rule name=""Hide"" uid=""{7DAB5F53-266A-4412-B28E-83E6B0F6128D}"">  <actions>
                                <action id=""{25F351A1-712D-45F8-857D-8AD95BB2ACE9}"" uid=""BD38CF4BFA31473886E84F4407887049"" />  </actions>
                                </rule>  <rule uid=""{00000000-0000-0000-0000-000000000000}"" name=""Default"">  <conditions>
                                <condition id=""{4888ABBB-F17D-4485-B14B-842413F88732}"" uid=""A76F1DF24376412B8F5F1B6F3F78F842"" />
                                </conditions>  <actions />  </rule>  </ruleset>  </rls>
                              </r>
                              </d><d id=""{46D2F427-4CE5-4E1F-BA10-EF3636F43534}"" l=""{14030E9F-CE92-49C6-AD87-7D49B50E42EA}"">
                              <r ds="""" id=""{493B3A83-0FA7-4484-8FC9-4680991CF743}"" par="""" ph=""content"" uid=""{A08C9132-DBD1-474F-A2CA-6CA26A4AA650}"" /></d></r>";

            string newLayout = @"<r xmlns:xsd=""http://www.w3.org/2001/XMLSchema""><d id=""{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}"" l=""{14030E9F-CE92-49C6-AD87-7D49B50E42EA}"">
                              <r ds="""" id=""{885B8314-7D8C-4CBB-8000-01421EA8F406}"" par="""" ph=""main"" uid=""{43222D12-08C9-453B-AE96-D406EBB95126}"" /><r ds="""" id=""{CE4ADCFB-7990-4980-83FB-A00C1E3673DB}"" par="""" ph=""/main/centercolumn"" uid=""{CF044AD9-0332-407A-ABDE-587214A2C808}"" />
                              <r ds="""" id=""{493B3A83-0FA7-4484-8FC9-4680991CF743}"" par="""" ph=""/main/centercolumn/content"" uid=""{B343725A-3A93-446E-A9C8-3A2CBD3DB489}"">
                                <rls>  <ruleset>  <rule name=""Hide"" uid=""{7DAB5F53-266A-4412-B28E-83E6B0F6128D}"">  <actions>
                                <action id=""{25F351A1-712D-45F8-857D-8AD95BB2ACE9}"" uid=""BD38CF4BFA31473886E84F4407887049"" />  </actions>
                                </rule>  <rule uid=""{00000000-0000-0000-0000-000000000000}"" name=""Default"">  <conditions>
                                <condition id=""{4888ABBB-F17D-4485-B14B-842413F88732}"" uid=""A76F1DF24376412B8F5F1B6F3F78F842"" />
                                </conditions>  <actions />  </rule>  </ruleset>  </rls>
                              </r>
                              </d>
                                        <d id=""{46D2F427-4CE5-4E1F-BA10-EF3636F43534}"" l=""{14030E9F-CE92-49C6-AD87-7D49B50E42EA}"">
                              <r ds="""" id=""{493B3A83-0FA7-4484-8FC9-4680991CF743}"" par="""" ph=""content"" uid=""{A08C9132-DBD1-474F-A2CA-6CA26A4AA650}"" /></d>
                                </r>";

            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            var fieldId = ID.NewID;
            var field = Substitute.For<Field>(fieldId, item);
            field.Value.Returns(originalValue);
            field.Type.Returns("layout");
            item.Fields.Returns(Substitute.For<FieldCollection>(item));
            item.Fields[fieldId].Returns(field);

            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID,
                    Fields = new List<HorizonArgsSaveField>()
                    {
                        new HorizonArgsSaveField()
                        {
                            ID = fieldId,
                            Value = newLayout
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Items[0].Fields[0].Value.Should().BeEquivalentTo(originalValue);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            ConvertLayoutField sut)
        {
            // arrange
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).ReturnsNull();

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = ID.NewID
                },
            };

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().Be(false);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNotLayout(
            [Frozen] BaseItemManager itemManager,
            ConvertLayoutField sut)
        {
            // arrange

            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            var fieldId = ID.NewID;
            var field = Substitute.For<Field>(fieldId, item);
            field.Value.Returns("<xml><invalid_xml>");
            field.Type.Returns("not_layout");
            item.Fields.Returns(Substitute.For<FieldCollection>(item));
            item.Fields[fieldId].Returns(field);

            itemManager.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).Returns(item);

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID,
                    Fields = new List<HorizonArgsSaveField>()
                    {
                        new HorizonArgsSaveField()
                        {
                            ID = fieldId
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().BeFalse();
        }
    }
}
