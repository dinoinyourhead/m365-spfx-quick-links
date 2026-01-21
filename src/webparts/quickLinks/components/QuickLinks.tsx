import * as React from 'react';
import styles from './QuickLinks.module.scss';
import type { IQuickLinksProps } from './IQuickLinksProps';

export default class QuickLinks extends React.Component<IQuickLinksProps> {
  public render(): React.ReactElement<IQuickLinksProps> {
    const webPartBg = this.props.webPartBgType === 'transparent' ? 'transparent' : this.props.webPartBgColor;
    const tileBg = this.props.tileBgType === 'transparent' ? 'transparent' : this.props.tileBgColor;
    const tileBorder = this.props.tileBorderType === 'transparent' ? 'transparent' : this.props.tileBorderColor;

    return (
      <section className={styles.quickLinks} style={{ backgroundColor: webPartBg }}>
        <div className={styles.grid}>
          {this.props.quickLinks && this.props.quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className={styles.tile}
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: tileBg,
                borderColor: tileBorder,
                borderRadius: `${this.props.tileBorderRadius}px`,
                boxShadow: this.props.tileShadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              {link.iconUrl && (
                <img
                  src={link.iconUrl}
                  className={styles.icon}
                  alt={link.title}
                  style={{
                    height: `${this.props.iconSize}%`, /* Direct percentage from slider */
                    width: 'auto'
                  }}
                />
              )}
              {this.props.showTitle && (
                <span
                  className={styles.title}
                  style={{
                    color: this.props.titleColor || '#333333',
                    fontSize: `${this.props.titleFontSize || 14}px`
                  }}
                >
                  {link.title}
                </span>
              )}
            </a>
          ))}
          {(!this.props.quickLinks || this.props.quickLinks.length === 0) && (
            <div>Please configure Quick Links in the properties pane.</div>
          )}
        </div>
      </section>
    );
  }
}
