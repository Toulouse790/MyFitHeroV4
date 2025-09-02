// Service pour le module sleep

export class SleepService {
  private static readonly BASE_URL = '/api/sleep';

  // Méthodes de base
  static async getSleepData(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur API sleep:', error);
      return this.getMockSleepData();
    }
  }

  static async updateSleep(userId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur mise à jour sleep:', error);
      throw error;
    }
  }

  // Données de mock
  private static getMockSleepData(): any {
    return {
      id: 'mock_sleep_' + Date.now(),
      userId: 'user_123',
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
