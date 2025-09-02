// Service pour le module social

export class SocialService {
  private static readonly BASE_URL = '/api/social';

  // Méthodes de base
  static async getSocialData(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur API social:', error);
      return this.getMockSocialData();
    }
  }

  static async updateSocial(userId: string, data: any): Promise<any> {
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
      console.error('Erreur mise à jour social:', error);
      throw error;
    }
  }

  // Données de mock
  private static getMockSocialData(): any {
    return {
      id: 'mock_social_' + Date.now(),
      userId: 'user_123',
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
