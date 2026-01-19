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
import { PropertyFieldColorPicker, PropertyFieldColorPickerStyle } from '@pnp/spfx-property-controls/lib/PropertyFieldColorPicker';
import { IQuickLink } from './components/IQuickLinksProps';
import { CollectionFilePicker } from './components/CollectionFilePicker'; // New

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
  tileBorderColor: string;
  tileBorderRadius: number;
  showTitle: boolean;
  iconSize: number;
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
        tileBorderColor: this.properties.tileBorderColor || '#eaeaea',
        tileBorderRadius: this.properties.tileBorderRadius || 4,
        showTitle: this.properties.showTitle !== false,
        iconSize: this.properties.iconSize || 50
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
                PropertyPaneSlider('tileBorderRadius', {
                  label: "Tile Border Radius",
                  min: 0,
                  max: 50,
                  value: this.properties.tileBorderRadius || 4
                }),
                PropertyPaneSlider('iconSize', {
                  label: "Logo Size (px)",
                  min: 20,
                  max: 150,
                  value: this.properties.iconSize || 50
                }),
                PropertyFieldCollectionData('quickLinks', {
                  key: 'quickLinks',
                  label: 'Quick Links Data',
                  panelHeader: 'Manage Quick Links',
                  manageBtnLabel: 'Manage Links',
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
                          onChanged: (url: string) => {
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
                ...(this.properties.webPartBgType === 'color' ? [PropertyFieldColorPicker('webPartBgColor', {
                  key: 'webPartBgColor',
                  label: 'Web Part Background Color',
                  selectedColor: this.properties.webPartBgColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 1000,
                  style: PropertyFieldColorPickerStyle.Inline
                })] : []),
                PropertyPaneChoiceGroup('tileBgType', {
                  label: 'Tile Background By',
                  options: [
                    { key: 'transparent', text: 'Transparent' },
                    { key: 'color', text: 'Color' }
                  ]
                }),
                ...(this.properties.tileBgType === 'color' ? [PropertyFieldColorPicker('tileBgColor', {
                  key: 'tileBgColor',
                  label: 'Tile Background Color',
                  selectedColor: this.properties.tileBgColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 1000,
                  style: PropertyFieldColorPickerStyle.Inline
                })] : []),
                PropertyFieldColorPicker('tileBorderColor', {
                  key: 'tileBorderColor',
                  label: 'Tile Border Color',
                  selectedColor: this.properties.tileBorderColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 1000,
                  style: PropertyFieldColorPickerStyle.Inline
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
