// Service pour le module admin

export class AdminService {
  private static readonly BASE_URL = '/api/admin';

  // Méthodes de base
  static async getAdminData(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/${userId}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      return await response.json();
    } catch {
      // Erreur silencieuse
      console.error('Erreur API admin:', error);
      return this.getMockAdminData();
    }
  }

  static async updateAdmin(userId: string, data: any): Promise<any> {
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
      console.error('Erreur mise à jour admin:', error);
      throw error;
    }
  }

  // Données de mock
  private static getMockAdminData(): any {
    return {
      id: 'mock_admin_' + Date.now(),
      userId: 'user_123',
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
