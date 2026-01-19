import * as React from 'react';
import styles from './QuickLinks.module.scss';
import type { IQuickLinksProps } from './IQuickLinksProps';

export default class QuickLinks extends React.Component<IQuickLinksProps> {
  public render(): React.ReactElement<IQuickLinksProps> {

    return (
      <section className={styles.quickLinks} style={{ backgroundColor: this.props.webPartBgColor }}>
        <div className={styles.grid}>
          {this.props.quickLinks && this.props.quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className={styles.tile}
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: this.props.tileBgColor,
                borderColor: this.props.tileBorderColor,
                borderRadius: `${this.props.tileBorderRadius}px`
              }}
            >
              {link.iconUrl && (
                <img
                  src={link.iconUrl}
                  className={styles.icon}
                  alt={link.title}
                  style={{ height: `${this.props.iconSize}px`, maxHeight: '80%' }}
                />
              )}
              {this.props.showTitle && (
                <span className={styles.title}>{link.title}</span>
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
