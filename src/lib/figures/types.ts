import type { ChartProps } from '../../components/charts/Chart';
export type FigureSpec = Omit<ChartProps, 'width' | 'height' | 'interactive'>;
