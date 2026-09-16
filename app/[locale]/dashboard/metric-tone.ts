export const METRIC_TONE = { blue: "blue", orange: "orange" } as const;

export type MetricTone = (typeof METRIC_TONE)[keyof typeof METRIC_TONE];
