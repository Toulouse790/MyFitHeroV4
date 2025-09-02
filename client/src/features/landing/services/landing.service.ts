// Service pour le module landing

export class LandingService {
  private static readonly BASE_URL = '/api/landing';

  // Méthodes de base
  static async getLandingData(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur API landing:', error);
      return this.getMockLandingData();
    }
  }

  static async updateLanding(userId: string, data: any): Promise<any> {
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
      console.error('Erreur mise à jour landing:', error);
      throw error;
    }
  }

  // Données de mock
  private static getMockLandingData(): any {
    return {
      id: 'mock_landing_' + Date.now(),
      userId: 'user_123',
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
