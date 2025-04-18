// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Text;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Properties;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items
{
    public class PermanentItems
    {
        private static PermanentItems _permanentlyCreatedItems;
        private ItemOperations _itemOperations;
        private HelperService _helperService;
        private ILayoutItem _mvcLayoutWithDebugFunctionality;
        private ILayoutItem _mvcLayout;
        private ILayoutItem _webFormsLayoutWithDebugFunctionality;
        private ITemplateItem _templateWithMvcPresentaion;
        private ITemplateItem _templateWithAllFieldTypes;
        private ITemplateItem _templateInheritedFromFolderTemplate;
        private IRenderingItem _xslSampleRendering;
        private IRenderingItem _mvcSampleRendering;
        private IRenderingItem _mvcSampleRendering2;
        private IRenderingItem _mvcSampleRendering3;
        private IRenderingItem _mvcRenderingWithAllFieldTypes;

        private PermanentItems(ItemOperations itemOperations, HelperService helperService)
        {
            _itemOperations = itemOperations;
            _helperService = helperService;
        }

        public static PermanentItems GetPermanentlyCreatedItems(ItemOperations itemOperations, HelperService helperService)
        {
            if (_permanentlyCreatedItems == null)
            {
                _permanentlyCreatedItems = new PermanentItems(itemOperations, helperService);
            }

            return _permanentlyCreatedItems;
        }

        public ILayoutItem GetMvcLayoutWithDebugFunctionality()
        {
            if (_mvcLayoutWithDebugFunctionality == null)
            {
                string fileName = "MvcLayoutWithDebugFunctionality";
                string fleExtension = "cshtml";
                var fullPath = $"/sitecore/Layouts/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _mvcLayoutWithDebugFunctionality = new LayoutItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    byte[] layout = Encoding.ASCII.GetBytes(Resources.MvcDebugLayout);
                    _mvcLayoutWithDebugFunctionality = _itemOperations.CreateLayout(new LayoutParams(name: fileName, associatedFileContent: layout, fileExtension: fleExtension));
                    TestData.ItemsToDelete.Remove(_mvcLayoutWithDebugFunctionality);
                    TestData.FilesToDelete.Remove(_mvcLayoutWithDebugFunctionality.AssociatedFile);
                }
            }

            return _mvcLayoutWithDebugFunctionality;
        }

        public ILayoutItem GetWebFormsLayoutWithDebugFunctionality()
        {
            if (_webFormsLayoutWithDebugFunctionality == null)
            {
                string fileName = "WebFormsLayoutWithDebugFunctionality";
                string fleExtension = "aspx";
                var fullPath = $"/sitecore/Layouts/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _webFormsLayoutWithDebugFunctionality = new LayoutItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    byte[] layout = Encoding.ASCII.GetBytes(Resources.WebFormsDebugLayout);
                    _webFormsLayoutWithDebugFunctionality = _itemOperations.CreateLayout(new LayoutParams(name: fileName, associatedFileContent: layout, fileExtension: fleExtension));
                    TestData.ItemsToDelete.Remove(_webFormsLayoutWithDebugFunctionality);
                    TestData.FilesToDelete.Remove(_webFormsLayoutWithDebugFunctionality.AssociatedFile);
                }
            }

            return _webFormsLayoutWithDebugFunctionality;
        }

        public ILayoutItem GetMvcSampleLayout()
        {
            if (_mvcLayout == null)
            {
                string fileName = "MvcLayout";
                var fullPath = $"/sitecore/layouts/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _mvcLayout = new LayoutItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    _mvcLayout = _itemOperations.CreateLayout(new LayoutParams(name: fileName, fileExtension: "cshtml", associatedFileContent: Resources.MvcLayout));
                    TestData.ItemsToDelete.Remove(_mvcLayout);
                    TestData.FilesToDelete.Remove(_mvcLayout.AssociatedFile);
                }
            }

            return _mvcLayout;
        }

        public IRenderingItem GetMvcSampleRendering()
        {
            if (_mvcSampleRendering == null)
            {
                string fileName = "SampleMvcRendering";
                var fullPath = $"/sitecore/rendering/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _mvcSampleRendering = new RenderingItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    _mvcSampleRendering = _itemOperations.CreateRendering(LayoutType.Mvc, fileName, Resources.MvcRendering);
                    TestData.ItemsToDelete.Remove(_mvcSampleRendering);
                    TestData.FilesToDelete.Remove(_mvcSampleRendering.AssociatedFile);
                }
            }

            return _mvcSampleRendering;
        }

        public IRenderingItem GetMvcSampleRendering2()
        {
            if (_mvcSampleRendering2 == null)
            {
                string fileName = "SampleMvcRendering2";
                var fullPath = $"/sitecore/rendering/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _mvcSampleRendering2 = new RenderingItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    _mvcSampleRendering2 = _itemOperations.CreateRendering(LayoutType.Mvc, fileName, Resources.MvcRendering2);
                    TestData.ItemsToDelete.Remove(_mvcSampleRendering2);
                    TestData.FilesToDelete.Remove(_mvcSampleRendering2.AssociatedFile);
                }
            }

            return _mvcSampleRendering2;
        }

        public IRenderingItem GetMvcSampleRendering3()
        {
            if (_mvcSampleRendering3 == null)
            {
                string fileName = "SampleMvcRendering3";
                var fullPath = $"/sitecore/rendering/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _mvcSampleRendering3 = new RenderingItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    _mvcSampleRendering3 = _itemOperations.CreateRendering(LayoutType.Mvc, fileName, Resources.MvcRendering3);
                    TestData.ItemsToDelete.Remove(_mvcSampleRendering3);
                    TestData.FilesToDelete.Remove(_mvcSampleRendering3.AssociatedFile);
                }
            }

            return _mvcSampleRendering3;
        }

        public IRenderingItem GetXslSampleRendering()
        {
            if (_xslSampleRendering == null)
            {
                string fileName = "SampleXslRendering";
                var fullPath = $"/sitecore/rendering/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _xslSampleRendering = new RenderingItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    _xslSampleRendering = _itemOperations.CreateRendering(LayoutType.Sample, fileName);
                    TestData.ItemsToDelete.Remove(_xslSampleRendering);
                    TestData.FilesToDelete.Remove(_xslSampleRendering.AssociatedFile);
                }
            }

            return _xslSampleRendering;
        }

        public IRenderingItem GetMvcRenderingWithAllFieldTypes()
        {
            if (_mvcRenderingWithAllFieldTypes == null)
            {
                string fileName = "MvcRenderingWithAllFieldTypes";
                var fullPath = $"/sitecore/rendering/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _mvcRenderingWithAllFieldTypes = new RenderingItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    _mvcRenderingWithAllFieldTypes = _itemOperations.CreateRendering(LayoutType.Mvc, fileName, Resources.MvcRenderingWithAllFieldTypes);
                    TestData.ItemsToDelete.Remove(_mvcRenderingWithAllFieldTypes);
                    TestData.FilesToDelete.Remove(_mvcRenderingWithAllFieldTypes.AssociatedFile);
                }
            }

            return _mvcRenderingWithAllFieldTypes;
        }

        public ITemplateItem GetSampleTemplateWithMvcPresentation()
        {
            if (_templateWithMvcPresentaion == null)
            {
                string fileName = "TemplateWithMvcPresentation";
                var fullPath = $"/sitecore/templates/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _templateWithMvcPresentaion = new TemplateItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    _templateWithMvcPresentaion = _itemOperations.CreateTemplate(
                        new TemplateParams(path: fullPath, fieldsSections: DefaultScData.SampleItemFields, hasStandardValues: true));
                    ILayoutItem mvcLayout = GetMvcSampleLayout();
                    IRenderingItem mvcRendering = GetMvcSampleRendering();
                    _templateWithMvcPresentaion.StandardValues.StandardFields.Layout.AssignLayout(mvcLayout).AddControl(mvcRendering);
                    _helperService.EditItem(_templateWithMvcPresentaion.StandardValues.Id, "Title", "$name");
                    TestData.ItemsToDelete.Remove(_templateWithMvcPresentaion);
                    TestData.ItemsToDelete.Remove(_templateWithMvcPresentaion.StandardValues);
                }
            }

            return _templateWithMvcPresentaion;
        }

        public ITemplateItem GetTemplateInheritedFromFolderTemplate()
        {
            if (_templateInheritedFromFolderTemplate == null)
            {
                string fileName = "TemplateInheritedFromFolderTemplate";
                var fullPath = $"/sitecore/templates/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _templateInheritedFromFolderTemplate = new TemplateItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    _templateInheritedFromFolderTemplate = _itemOperations.CreateTemplate(
                        new TemplateParams(baseTemplate: "Common/Folder", path: fullPath, fieldsSections: DefaultScData.SampleItemFields, hasStandardValues: true));
                    TestData.ItemsToDelete.Remove(_templateInheritedFromFolderTemplate);
                }
            }

            return _templateInheritedFromFolderTemplate;
        }

        public ITemplateItem GetTemplateWithAllFieldTypes()
        {
            if (_templateWithAllFieldTypes == null)
            {
                string fileName = "TemplateWithAllFieldTypesAndMvcPresentation";
                var fullPath = $"/sitecore/templates/{fileName}";
                if (!string.IsNullOrEmpty(_helperService.GetItemIdByPath(fullPath)))
                {
                    _templateWithAllFieldTypes = new TemplateItem(fullPath, DatabaseType.Master, _helperService);
                }
                else
                {
                    var fieldSections = new List<TemplateSection>
                    {
                        new TemplateSection("Data", new Dictionary<string, string>
                        {
                            {
                                "Title", "Single-Line Text" //lets keep this Title 
                            },
                            {
                                "SingleLineTextField", "Single-Line Text"
                            },
                            {
                                "RichTextField", "Rich Text"
                            },
                            {
                                "MultiLineTextField", "Multi-Line Text"
                            },
                            {
                                "ImageField", "Image"
                            },
                            {
                                "DateField", "Date"
                            },
                            {
                                "NumberField", "Number"
                            },
                            {
                                "IntegerField", "Integer"
                            },
                            {
                                "GeneralLinkField", "General Link"
                            }
                        })
                    };

                    _templateWithAllFieldTypes = _itemOperations.CreateTemplate(new TemplateParams(path: fullPath, fieldsSections: fieldSections, hasStandardValues: true));
                    ILayoutItem mvcLayout = GetMvcSampleLayout();
                    IRenderingItem mvcRendering = GetMvcRenderingWithAllFieldTypes();
                    _templateWithAllFieldTypes.StandardValues.StandardFields.Layout.AssignLayout(mvcLayout).AddControl(mvcRendering);
                    _helperService.EditItem(_templateWithAllFieldTypes.StandardValues.Id, "Title", "$name");

                    TestData.ItemsToDelete.Remove(_templateWithAllFieldTypes);
                    TestData.ItemsToDelete.Remove(_templateWithAllFieldTypes.StandardValues);
                }
            }

            return _templateWithAllFieldTypes;
        }
    }
}
