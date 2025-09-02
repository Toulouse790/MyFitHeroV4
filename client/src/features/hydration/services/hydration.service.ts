// Service pour le module hydration

export class HydrationService {
  private static readonly BASE_URL = '/api/hydration';

  // Méthodes de base
  static async getHydrationData(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur API hydration:', error);
      return this.getMockHydrationData();
    }
  }

  static async updateHydration(userId: string, data: any): Promise<any> {
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
      console.error('Erreur mise à jour hydration:', error);
      throw error;
    }
  }

  // Données de mock
  private static getMockHydrationData(): any {
    return {
      id: 'mock_hydration_' + Date.now(),
      userId: 'user_123',
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
