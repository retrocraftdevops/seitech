/**
 * Agent 2: Performance - Odoo API Request Batching
 * Reduces N+1 query problem by batching multiple requests
 */

interface QueuedRequest {
  model: string;
  method: string;
  args: any[];
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export class OdooBatchClient {
  private queue: QueuedRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // ms
  private readonly MAX_BATCH_SIZE = 10;

  constructor(private baseUrl: string, private database: string) {}

  async call(model: string, method: string, args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ model, method, args, resolve, reject });

      // Auto-flush if queue is full
      if (this.queue.length >= this.MAX_BATCH_SIZE) {
        this.flush();
      } else if (!this.batchTimeout) {
        // Schedule batch execution
        this.batchTimeout = setTimeout(() => this.flush(), this.BATCH_DELAY);
      }
    });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      // Execute all requests in parallel
      const results = await this.executeBatch(batch);
      
      // Resolve all promises
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises
      batch.forEach((item) => {
        item.reject(error);
      });
    }
  }

  private async executeBatch(batch: QueuedRequest[]): Promise<any[]> {
    // Group by model for efficiency
    const grouped = batch.reduce((acc, req) => {
      if (!acc[req.model]) {
        acc[req.model] = [];
      }
      acc[req.model].push(req);
      return {};
    }, {} as Record<string, QueuedRequest[]>);

    // Execute grouped requests
    const results = await Promise.all(
      batch.map(async (req) => {
        try {
          const response = await fetch(`${this.baseUrl}/jsonrpc`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'call',
              params: {
                service: 'object',
                method: 'execute',
                args: [this.database, req.model, req.method, ...req.args],
              },
              id: Math.random(),
            }),
          });

          const data = await response.json();
          return data.result;
        } catch (error) {
          throw error;
        }
      })
    );

    return results;
  }

  // Helper method to batch search_read calls
  async searchReadBatch<T>(
    requests: Array<{
      model: string;
      domain: any[];
      fields: string[];
    }>
  ): Promise<T[][]> {
    return Promise.all(
      requests.map((req) =>
        this.call(req.model, 'search_read', [req.domain, req.fields])
      )
    );
  }
}

// Usage example:
// const batchClient = new OdooBatchClient(url, database);
// const [courses, categories, instructors] = await Promise.all([
//   batchClient.call('slide.channel', 'search_read', [[], ['name']]),
//   batchClient.call('course.category', 'search_read', [[], ['name']]),
//   batchClient.call('res.users', 'search_read', [[], ['name']]),
// ]);
