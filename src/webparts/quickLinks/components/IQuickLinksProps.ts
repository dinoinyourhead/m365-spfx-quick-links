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
  webPartBgColor: string;
  tileBgColor: string;
  tileBorderColor: string;
  tileBorderRadius: number;
  showTitle: boolean;
  iconSize: number;
}
