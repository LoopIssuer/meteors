/**
 * Database - Handles Supabase operations
 */
class Database {
    constructor() {
        this.client = window.supabase.createClient(
            CONFIG.SUPABASE_URL, 
            CONFIG.SUPABASE_ANON_KEY
        );
        this.tableName = 'meteorshighscore';
    }
    
    /**
     * Fetch all players ordered by highscore
     * @returns {Promise<Array>} Array of player objects
     */
    async getPlayers() {
        try {
            const { data, error } = await this.client
                .from(this.tableName)
                .select('*')
                .order('highscore', { ascending: false });
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database.getPlayers error:', error);
            throw error;
        }
    }
    
    /**
     * Update player's highscore
     * @param {number} playerId - Player ID
     * @param {number} newScore - New highscore value
     * @returns {Promise<boolean>} Success status
     */
    async updateHighscore(playerId, newScore) {
        try {
            const { error } = await this.client
                .from(this.tableName)
                .update({ highscore: newScore })
                .eq('id', playerId);
                
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Database.updateHighscore error:', error);
            return false;
        }
    }
    
    /**
     * Get player by ID
     * @param {number} playerId - Player ID
     * @returns {Promise<Object|null>} Player object or null
     */
    async getPlayer(playerId) {
        try {
            const { data, error } = await this.client
                .from(this.tableName)
                .select('*')
                .eq('id', playerId)
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database.getPlayer error:', error);
            return null;
        }
    }
}