export interface OdooConfig {
  url: string;
  database: string;
}

export interface OdooSession {
  uid: number;
  sessionId: string;
  partnerId: number;
  username: string;
  name: string;
}

export type Domain = [string, string, unknown];

export interface SearchOptions {
  offset?: number;
  limit?: number;
  order?: string;
}

export interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data: {
      name: string;
      message: string;
      debug: string;
    };
  };
}

class OdooClient {
  private config: OdooConfig;
  private session: OdooSession | null = null;
  private sessionCookie: string | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  private async jsonRpc<T>(
    endpoint: string,
    method: string,
    params: Record<string, unknown>,
    extractCookie = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Include session cookie if available (for server-side requests)
    if (this.sessionCookie) {
      headers['Cookie'] = this.sessionCookie;
    }

    const response = await fetch(`${this.config.url}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    // Extract session cookie from response (for authentication)
    if (extractCookie) {
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        // Extract session_id cookie
        const sessionMatch = setCookie.match(/session_id=([^;]+)/);
        if (sessionMatch) {
          this.sessionCookie = `session_id=${sessionMatch[1]}`;
        }
      }
    }

    const data: JsonRpcResponse<T> = await response.json();

    if (data.error) {
      throw new Error(data.error.data?.message || data.error.message || 'Odoo API Error');
    }

    return data.result as T;
  }

  async authenticate(email: string, password: string): Promise<OdooSession> {
    const result = await this.jsonRpc<{
      uid: number | false;
      session_id: string;
      partner_id: number;
      username: string;
      name: string;
    }>('/web/session/authenticate', 'call', {
      db: this.config.database,
      login: email,
      password,
    }, true); // Extract session cookie from response

    if (!result.uid) {
      throw new Error('Invalid credentials');
    }

    this.session = {
      uid: result.uid as number,
      sessionId: result.session_id,
      partnerId: result.partner_id,
      username: result.username,
      name: result.name,
    };

    return this.session;
  }

  async logout(): Promise<void> {
    await this.jsonRpc('/web/session/destroy', 'call', {});
    this.session = null;
  }

  async getSession(): Promise<OdooSession | null> {
    try {
      const result = await this.jsonRpc<{ uid: number | false; partner_id: number; name: string }>(
        '/web/session/get_session_info',
        'call',
        {}
      );

      if (result.uid) {
        this.session = {
          uid: result.uid as number,
          sessionId: '',
          partnerId: result.partner_id,
          username: '',
          name: result.name,
        };
        return this.session;
      }
    } catch {
      // Session not valid
    }
    return null;
  }

  async call<T>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {}
  ): Promise<T> {
    return this.jsonRpc<T>('/web/dataset/call_kw', 'call', {
      model,
      method,
      args,
      kwargs,
    });
  }

  async searchRead<T>(
    model: string,
    domain: Domain[] = [],
    fields: string[] = [],
    options: SearchOptions = {}
  ): Promise<T[]> {
    return this.call<T[]>(model, 'search_read', [], {
      domain,
      fields,
      offset: options.offset || 0,
      limit: options.limit || 80,
      order: options.order || 'id desc',
    });
  }

  async read<T>(model: string, ids: number[], fields: string[] = []): Promise<T[]> {
    return this.call<T[]>(model, 'read', [ids, fields]);
  }

  async create(model: string, values: Record<string, unknown>): Promise<number> {
    return this.call<number>(model, 'create', [values]);
  }

  async write(
    model: string,
    ids: number[],
    values: Record<string, unknown>
  ): Promise<boolean> {
    return this.call<boolean>(model, 'write', [ids, values]);
  }

  async unlink(model: string, ids: number[]): Promise<boolean> {
    return this.call<boolean>(model, 'unlink', [ids]);
  }

  async searchCount(model: string, domain: Domain[] = []): Promise<number> {
    return this.call<number>(model, 'search_count', [domain]);
  }

  // Helper method for custom API endpoints
  async customEndpoint<T>(route: string, data: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(`${this.config.url}${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  }

  getConfig(): OdooConfig {
    return this.config;
  }

  isAuthenticated(): boolean {
    return this.session !== null;
  }

  getCurrentSession(): OdooSession | null {
    return this.session;
  }
}

// Singleton instance
let odooClient: OdooClient | null = null;
let authPromise: Promise<void> | null = null;
let lastAuthTime = 0;
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes session TTL

export function getOdooClient(): OdooClient {
  if (!odooClient) {
    const url = process.env.NEXT_PUBLIC_ODOO_URL;
    const database = process.env.ODOO_DATABASE;

    if (!url || !database) {
      throw new Error('Odoo configuration missing. Set NEXT_PUBLIC_ODOO_URL and ODOO_DATABASE.');
    }

    odooClient = new OdooClient({ url, database });
  }
  return odooClient;
}

// Force re-authentication (e.g., after session expiry)
export function clearOdooSession(): void {
  if (odooClient) {
    // Clear the internal session state and cookie
    (odooClient as any).session = null;
    (odooClient as any).sessionCookie = null;
  }
  lastAuthTime = 0;
  authPromise = null;
}

// Check if session might be expired
function isSessionExpired(): boolean {
  if (lastAuthTime === 0) return true;
  return Date.now() - lastAuthTime > SESSION_TTL;
}

// Auto-authenticate for server-side API calls
export async function getAuthenticatedOdooClient(): Promise<OdooClient> {
  const client = getOdooClient();

  // Re-authenticate if session might be expired
  if (isSessionExpired()) {
    clearOdooSession();
  }

  // If already authenticated and session is fresh, return
  if (client.isAuthenticated() && !isSessionExpired()) {
    return client;
  }

  // If authentication is in progress, wait for it
  if (authPromise) {
    await authPromise;
    return client;
  }

  // Server-side auto-authentication
  const adminUser = process.env.ODOO_ADMIN_USER;
  const adminPassword = process.env.ODOO_ADMIN_PASSWORD;

  if (adminUser && adminPassword) {
    authPromise = client.authenticate(adminUser, adminPassword)
      .then(() => {
        lastAuthTime = Date.now();
        authPromise = null;
      })
      .catch((err) => {
        authPromise = null;
        console.error('Odoo auto-authentication failed:', err);
        throw err;
      });
    await authPromise;
  }

  return client;
}

export function createOdooClient(config: OdooConfig): OdooClient {
  return new OdooClient(config);
}

export { OdooClient };
