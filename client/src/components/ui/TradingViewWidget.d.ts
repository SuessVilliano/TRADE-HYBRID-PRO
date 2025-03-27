// Declaration file for TradingViewWidget component
export interface TradingViewWidgetProps {
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

declare const TradingViewWidget: React.MemoExoticComponent<(props: TradingViewWidgetProps) => JSX.Element>;
export default TradingViewWidget;