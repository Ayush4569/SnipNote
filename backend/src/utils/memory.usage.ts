
export function logMemoryUsage(label: string) {
    const used = process.memoryUsage();
    console.log(`[${label}] Memory usage:`, {
      rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(used.external / 1024 / 1024)}MB`
    });
  }
  
  