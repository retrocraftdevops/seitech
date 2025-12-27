/**
 * Odoo API Client
 * Provides methods to interact with Odoo backend
 */

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';

interface OdooResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class OdooClient {
  private baseURL: string;
  private sessionId?: string;

  constructor(baseURL: string = ODOO_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Authenticate with Odoo and get session
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/web/session/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {
            db: process.env.ODOO_DATABASE || 'odoo',
            login: username,
            password: password,
          },
        }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.result && data.result.uid) {
        this.sessionId = data.result.session_id;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Odoo authentication error:', error);
      return false;
    }
  }

  /**
   * Call Odoo model method
   */
  async call<T = any>(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: Record<string, any> = {}
  ): Promise<OdooResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {
            model,
            method,
            args,
            kwargs,
          },
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error.data?.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.result,
      };
    } catch (error) {
      console.error('Odoo call error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Search records
   */
  async search<T = any>(
    model: string,
    domain: any[] = [],
    options: {
      fields?: string[];
      limit?: number;
      offset?: number;
      order?: string;
    } = {}
  ): Promise<OdooResponse<T[]>> {
    return this.call(model, 'search_read', [domain], options);
  }

  /**
   * Search count - get number of records matching domain
   */
  async searchCount(model: string, domain: any[] = []): Promise<number> {
    const result = await this.call<number[]>(model, 'search', [domain], { limit: 0 });
    if (result.success && result.data) {
      return result.data.length;
    }
    return 0;
  }

  /**
   * Read records by ID
   */
  async read<T = any>(
    model: string,
    ids: number[],
    fields?: string[]
  ): Promise<OdooResponse<T[]>> {
    return this.call(model, 'read', [ids], { fields });
  }

  /**
   * Create record
   */
  async create<T = any>(
    model: string,
    values: Record<string, any>
  ): Promise<OdooResponse<number>> {
    return this.call(model, 'create', [values]);
  }

  /**
   * Update records
   */
  async write(
    model: string,
    ids: number[],
    values: Record<string, any>
  ): Promise<OdooResponse<boolean>> {
    return this.call(model, 'write', [ids, values]);
  }

  /**
   * Delete records
   */
  async unlink(model: string, ids: number[]): Promise<OdooResponse<boolean>> {
    return this.call(model, 'unlink', [ids]);
  }

  /**
   * Get current user info
   */
  async getUserInfo(): Promise<OdooResponse<any>> {
    try {
      const response = await fetch(`${this.baseURL}/web/session/get_session_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {},
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.result) {
        return {
          success: true,
          data: data.result,
        };
      }

      return {
        success: false,
        error: 'Failed to get user info',
      };
    } catch (error) {
      console.error('Get user info error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const odooClient = new OdooClient();
export const getOdooClient = () => odooClient;
export default odooClient;

// Helper function to get current user ID from session
export async function getCurrentUserId(): Promise<number | null> {
  try {
    const userInfo = await odooClient.getUserInfo();
    
    if (userInfo.success && userInfo.data?.uid) {
      return userInfo.data.uid;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}
