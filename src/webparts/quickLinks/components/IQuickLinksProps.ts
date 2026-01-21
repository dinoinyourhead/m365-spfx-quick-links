export interface IQuickLink {
  title: string;
  url: string;
  iconUrl: string;
}

export interface IQuickLinksProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  quickLinks: IQuickLink[];
  webPartBgType: 'transparent' | 'color';
  webPartBgColor: string;
  tileBgType: 'transparent' | 'color';
  tileBgColor: string;
  tileBorderType: 'transparent' | 'color';
  tileBorderColor: string;
  tileBorderRadius: number;
  tileShadow: boolean; // New: Enable box shadow on tiles
  showTitle: boolean;
  iconSize: number;
  titleColor: string;
  titleFontSize: number;
}
