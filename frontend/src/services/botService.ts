import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface BotStatus {
    platform: 'whatsapp' | 'telegram';
    connected: boolean;
    configured: boolean;
    lastMessageAt?: string;
    errorMessage?: string;
}

export interface BotMetrics {
    platform: 'whatsapp' | 'telegram';
    activeSessions: number;
    messagesProcessed: number;
    reportsSubmitted: number;
    averageResponseTime: number;
}

export interface BotSession {
    id: string;
    userId: string;
    platform: 'whatsapp' | 'telegram';
    state: string;
    startedAt: string;
    lastMessageAt: string;
    tempData: Record<string, any>;
}

export interface BotConfig {
    whatsapp: {
        enabled: boolean;
        apiUrl: string;
        phoneNumberId: string;
        webhookUrl: string;
    };
    telegram: {
        enabled: boolean;
        botToken: string;
        webhookUrl: string;
    };
}

class BotService {
    /**
     * Get bot status for all platforms
     */
    async getBotStatus(): Promise<BotStatus[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/bots/status`);
            const data = response.data;

            // Transform backend response to frontend format
            const statuses: BotStatus[] = [];

            if (data.telegram) {
                statuses.push({
                    platform: 'telegram',
                    connected: data.telegram.connected,
                    configured: !!data.telegram.webhook_url,
                    lastMessageAt: data.telegram.last_message,
                    errorMessage: data.telegram.error
                });
            }

            if (data.whatsapp) {
                statuses.push({
                    platform: 'whatsapp',
                    connected: data.whatsapp.connected,
                    configured: !!data.whatsapp.webhook_url,
                    lastMessageAt: data.whatsapp.last_message,
                    errorMessage: data.whatsapp.error
                });
            }

            return statuses;
        } catch (error) {
            console.error('Error fetching bot status:', error);
            // Return empty array on error - no mock data
            return [];
        }
    }

    /**
     * Get bot metrics
     */
    async getBotMetrics(): Promise<BotMetrics[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/bots/metrics`);
            const data = response.data;

            // Transform backend response to frontend format
            const metrics: BotMetrics[] = [];

            // Telegram metrics
            if (data.by_platform?.telegram) {
                const telegram = data.by_platform.telegram;
                metrics.push({
                    platform: 'telegram',
                    activeSessions: telegram.active_sessions || 0,
                    messagesProcessed: telegram.messages || 0,
                    reportsSubmitted: telegram.reports || 0,
                    averageResponseTime: telegram.avg_response_ms ?
                        (telegram.avg_response_ms / 1000).toFixed(1) : '0.0'
                });
            }

            // WhatsApp metrics
            if (data.by_platform?.whatsapp) {
                const whatsapp = data.by_platform.whatsapp;
                metrics.push({
                    platform: 'whatsapp',
                    activeSessions: whatsapp.active_sessions || 0,
                    messagesProcessed: whatsapp.messages || 0,
                    reportsSubmitted: whatsapp.reports || 0,
                    averageResponseTime: whatsapp.avg_response_ms ?
                        (whatsapp.avg_response_ms / 1000).toFixed(1) : '0.0'
                });
            }

            return metrics;
        } catch (error) {
            console.error('Error fetching bot metrics:', error);
            // Return empty array on error - no mock data
            return [];
        }
    }

    /**
     * Get active bot sessions
     */
    async getActiveSessions(): Promise<BotSession[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/bots/sessions`);
            const data = response.data;

            // Transform backend response to frontend format
            return (data.sessions || []).map((session: any, index: number) => ({
                id: `${session.platform}-${session.user_id}`,
                userId: session.user_id,
                platform: session.platform as 'whatsapp' | 'telegram',
                state: session.state || 'idle',
                startedAt: session.last_activity, // Backend doesn't track start time yet
                lastMessageAt: session.last_activity,
                tempData: {}
            }));
        } catch (error) {
            console.error('Error fetching active sessions:', error);
            return [];
        }
    }

    /**
     * Get bot configuration
     */
    async getBotConfig(): Promise<BotConfig> {
        try {
            const response = await axios.get(`${API_BASE_URL}/bots/config`);
            return response.data;
        } catch (error) {
            console.error('Error fetching bot config:', error);
            throw error;
        }
    }

    /**
     * Update bot configuration
     */
    async updateBotConfig(config: BotConfig): Promise<void> {
        try {
            await axios.put(`${API_BASE_URL}/bots/config`, config);
        } catch (error) {
            console.error('Error updating bot config:', error);
            throw error;
        }
    }

    /**
     * Test bot connection
     */
    async testConnection(platform: 'whatsapp' | 'telegram'): Promise<boolean> {
        try {
            const response = await axios.post(`${API_BASE_URL}/bots/test-connection`, { platform });
            return response.data.success;
        } catch (error) {
            console.error(`Error testing ${platform} connection:`, error);
            return false;
        }
    }

    /**
     * Send manual message to user
     */
    async sendMessage(sessionId: string, message: string): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/bots/sessions/${sessionId}/message`, { message });
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
}

export const botService = new BotService();
