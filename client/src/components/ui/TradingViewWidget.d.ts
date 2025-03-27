declare module './TradingViewWidget' {
  interface TradingViewWidgetProps {
    symbol?: string;
    theme?: 'light' | 'dark';
    width?: string | number;
    height?: string | number;
    interval?: string;
    timezone?: string;
    style?: string;
    locale?: string;
    toolbar_bg?: string;
    enable_publishing?: boolean;
    allow_symbol_change?: boolean;
    container_id?: string;
  }

  const TradingViewWidget: React.FC<TradingViewWidgetProps>;
  export default TradingViewWidget;
}