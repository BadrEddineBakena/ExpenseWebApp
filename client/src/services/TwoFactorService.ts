import axios from 'axios';

export class TwoFactorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TwoFactorError';
  }
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

class TwoFactorService {
  private static instance: TwoFactorService;
  private baseURL: string;

  private constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  public static getInstance(): TwoFactorService {
    if (!TwoFactorService.instance) {
      TwoFactorService.instance = new TwoFactorService();
    }
    return TwoFactorService.instance;
  }

  async setup2FA(): Promise<TwoFactorSetup> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${this.baseURL}/users/2fa/setup`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new TwoFactorError('Failed to setup 2FA');
    }
  }

  async verify2FA(code: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${this.baseURL}/users/2fa/verify`,
        { code },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.verified;
    } catch (error) {
      throw new TwoFactorError('Failed to verify 2FA code');
    }
  }

  async disable2FA(): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${this.baseURL}/users/2fa/disable`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      throw new TwoFactorError('Failed to disable 2FA');
    }
  }

  async generateBackupCodes(): Promise<string[]> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${this.baseURL}/auth/2fa/backup-codes`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.backupCodes;
    } catch (error) {
      throw new TwoFactorError('Failed to generate backup codes');
    }
  }
}

export default TwoFactorService.getInstance(); 