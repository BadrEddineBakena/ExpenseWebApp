import axios, { AxiosError } from 'axios';

export interface NotificationPreferences {
  email: boolean;
  budgetAlerts: boolean;
}

export interface BudgetAlert {
  userId: string;
  budgetId: string;
  currentAmount: number;
  targetAmount: number;
  threshold: number;
}

export class NotificationError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'NotificationError';
  }
}

class NotificationService {
  private static instance: NotificationService;
  private baseURL: string;

  private constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${this.baseURL}/users/${userId}/notifications`,
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      throw new NotificationError('Failed to update notification preferences');
    }
  }

  public async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${this.baseURL}/users/${userId}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      throw new NotificationError('Failed to get notification preferences');
    }
  }

  public async sendTestNotification(userId: string, type: 'email' | 'budgetAlerts'): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${this.baseURL}/users/${userId}/notifications/test`,
        { type },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      throw new NotificationError('Failed to send test notification');
    }
  }

  public async sendBudgetAlert(alert: BudgetAlert): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${this.baseURL}/notifications/budget-alert`,
        alert,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new NotificationError(
          `Failed to send budget alert: ${error.response?.data?.message || error.message}`,
          error
        );
      }
      throw new NotificationError('Failed to send budget alert', error);
    }
  }

  public async sendEmailNotification(userId: string, type: string, data: Record<string, unknown>): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${this.baseURL}/notifications/email/${userId}`,
        {
          type,
          data
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new NotificationError(
          `Failed to send email notification: ${error.response?.data?.message || error.message}`,
          error
        );
      }
      throw new NotificationError('Failed to send email notification', error);
    }
  }
}

export default NotificationService.getInstance(); 