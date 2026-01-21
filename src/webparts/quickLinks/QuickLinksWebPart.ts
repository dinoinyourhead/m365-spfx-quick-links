import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneSlider,
  PropertyPaneChoiceGroup // New
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { IQuickLink } from './components/IQuickLinksProps';
import { CollectionFilePicker } from './components/CollectionFilePicker';
import { PropertyPaneColorPickerField } from './PropertyPaneColorPickerField';

import * as strings from 'QuickLinksWebPartStrings';
import QuickLinks from './components/QuickLinks';
import { IQuickLinksProps } from './components/IQuickLinksProps';

export interface IQuickLinksWebPartProps {
  description: string;
  quickLinks: IQuickLink[];
  webPartBgType: 'transparent' | 'color';
  webPartBgColor: string;
  tileBgType: 'transparent' | 'color';
  tileBgColor: string;
  tileBorderType: 'transparent' | 'color';
  tileBorderColor: string;
  tileBorderRadius: number;
  tileShadow: boolean;
  showTitle: boolean;
  iconSize: number;
  titleColor: string;
  titleFontSize: number;
}

export default class QuickLinksWebPart extends BaseClientSideWebPart<IQuickLinksWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IQuickLinksProps> = React.createElement(
      QuickLinks,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        quickLinks: this.properties.quickLinks || [],
        webPartBgType: this.properties.webPartBgType || 'transparent',
        webPartBgColor: this.properties.webPartBgColor || '#ffffff',
        tileBgType: this.properties.tileBgType || 'color',
        tileBgColor: this.properties.tileBgColor || '#f3f3f3',
        tileBorderType: this.properties.tileBorderType || 'color',
        tileBorderColor: this.properties.tileBorderColor || '#eaeaea',
        tileBorderRadius: this.properties.tileBorderRadius || 4,
        tileShadow: this.properties.tileShadow !== false, // Default true
        showTitle: this.properties.showTitle !== false,
        iconSize: this.properties.iconSize || 40,
        titleColor: this.properties.titleColor || '#333333',
        titleFontSize: this.properties.titleFontSize || 14
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneToggle('showTitle', {
                  label: "Show Title",
                  checked: this.properties.showTitle !== false
                }),
                PropertyPaneToggle('tileShadow', {
                  label: "Tile Shadow",
                  checked: this.properties.tileShadow !== false
                }),
                PropertyPaneSlider('tileBorderRadius', {
                  label: "Tile Border Radius",
                  min: 0,
                  max: 50,
                  value: this.properties.tileBorderRadius || 4
                }),
                PropertyPaneSlider('iconSize', {
                  label: "Logo Size (%)",
                  min: 10,
                  max: 70,
                  value: this.properties.iconSize || 40
                }),
                PropertyPaneSlider('titleFontSize', {
                  label: "Title Font Size (px)",
                  min: 10,
                  max: 24,
                  value: this.properties.titleFontSize || 14
                }),
                PropertyFieldCollectionData('quickLinks', {
                  key: 'quickLinks',
                  label: 'Quick Links Data',
                  panelHeader: 'Manage Quick Links',
                  manageBtnLabel: 'Manage Links',
                  saveBtnLabel: 'Save',
                  saveAndAddBtnLabel: 'Save & Add Another',
                  cancelBtnLabel: 'Cancel',
                  enableSorting: true, // Enables drag & drop reordering
                  value: this.properties.quickLinks,
                  fields: [
                    {
                      id: 'title',
                      title: 'Title',
                      type: CustomCollectionFieldType.string,
                      required: true
                    },
                    {
                      id: 'url',
                      title: 'URL',
                      type: CustomCollectionFieldType.string,
                      required: true
                    },
                    {
                      id: 'iconUrl',
                      title: 'Logo',
                      type: CustomCollectionFieldType.custom,
                      onCustomRender: (field, value, onUpdate, item, itemId) => {
                        return React.createElement(CollectionFilePicker, {
                          context: this.context,
                          value: value || '',
                          onChange: (url: string) => {
                            onUpdate(field.id, url);
                          }
                        });
                      }
                    }
                  ],
                  disabled: false
                })
              ]
            },
            {
              groupName: "Styling",
              groupFields: [
                PropertyPaneChoiceGroup('webPartBgType', {
                  label: 'Web Part Background By',
                  options: [
                    { key: 'transparent', text: 'Transparent' },
                    { key: 'color', text: 'Color' }
                  ]
                }),
                ...(this.properties.webPartBgType === 'color' ? [PropertyPaneColorPickerField('webPartBgColor', {
                  key: 'webPartBgColor',
                  label: 'Web Part Background Color',
                  value: this.properties.webPartBgColor || '#ffffff',
                  onPropertyChange: (propertyPath: string, newValue: string) => {
                    this.properties.webPartBgColor = newValue;
                    this.render();
                  }
                })] : []),
                PropertyPaneChoiceGroup('tileBgType', {
                  label: 'Tile Background By',
                  options: [
                    { key: 'transparent', text: 'Transparent' },
                    { key: 'color', text: 'Color' }
                  ]
                }),
                ...(this.properties.tileBgType === 'color' ? [PropertyPaneColorPickerField('tileBgColor', {
                  key: 'tileBgColor',
                  label: 'Tile Background Color',
                  value: this.properties.tileBgColor || '#f3f3f3',
                  onPropertyChange: (propertyPath: string, newValue: string) => {
                    this.properties.tileBgColor = newValue;
                    this.render();
                  }
                })] : []),
                PropertyPaneChoiceGroup('tileBorderType', {
                  label: 'Tile Border By',
                  options: [
                    { key: 'transparent', text: 'Transparent' },
                    { key: 'color', text: 'Color' }
                  ]
                }),
                ...(this.properties.tileBorderType === 'color' ? [PropertyPaneColorPickerField('tileBorderColor', {
                  key: 'tileBorderColor',
                  label: 'Tile Border Color',
                  value: this.properties.tileBorderColor || '#eaeaea',
                  onPropertyChange: (propertyPath: string, newValue: string) => {
                    this.properties.tileBorderColor = newValue;
                    this.render();
                  }
                })] : []),
                PropertyPaneColorPickerField('titleColor', {
                  key: 'titleColor',
                  label: 'Link Title Color',
                  value: this.properties.titleColor || '#333333',
                  onPropertyChange: (propertyPath: string, newValue: string) => {
                    this.properties.titleColor = newValue;
                    this.render();
                  }
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
