/**
 * Performance Monitoring
 */

export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
}

export class PerformanceMonitor {
  static mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }
}
