// Service pour le module wearables

export class WearablesService {
  private static readonly BASE_URL = '/api/wearables';

  // Méthodes de base
  static async getWearablesData(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur API wearables:', error);
      return this.getMockWearablesData();
    }
  }

  static async updateWearables(userId: string, data: any): Promise<any> {
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
      console.error('Erreur mise à jour wearables:', error);
      throw error;
    }
  }

  // Données de mock
  private static getMockWearablesData(): any {
    return {
      id: 'mock_wearables_' + Date.now(),
      userId: 'user_123',
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
