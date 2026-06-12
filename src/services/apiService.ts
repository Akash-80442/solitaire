export const BASE_URL = 'https://trick-royale-server.onrender.com';

class ApiService {
  async createRoom(ip: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${BASE_URL}/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create room on server');
      }
      const data = await res.json();
      return data.roomCode;
    } catch (e: any) {
      throw new Error(`API Error: ${e.message}`);
    }
  }

  async getRoomIp(code: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${BASE_URL}/room/${code}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Invalid or expired Room Code');
      }
      const data = await res.json();
      return data.ip;
    } catch (e: any) {
      throw new Error(`API Error: ${e.message}`);
    }
  }
}

export const apiService = new ApiService();
