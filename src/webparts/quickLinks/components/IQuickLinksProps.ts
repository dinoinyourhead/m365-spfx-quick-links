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
  webPartBgType: 'transparent' | 'color'; // New
  webPartBgColor: string;
  tileBgType: 'transparent' | 'color'; // New
  tileBgColor: string;
  tileBorderColor: string;
  tileBorderRadius: number;
  showTitle: boolean;
  iconSize: number;
}
