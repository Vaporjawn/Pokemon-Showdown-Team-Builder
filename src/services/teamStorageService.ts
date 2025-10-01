import type {
  Team,
  TeamPokemon,
  JSONExportData,
  ShowdownImportResult,
  StatSpread
} from '../types/team';

/**
 * Comprehensive team storage service supporting localStorage, IndexedDB,
 * and cloud synchronization capabilities
 */

// Storage configuration
const STORAGE_CONFIG = {
  localStorage: {
    teamPrefix: 'pokemon_team_',
    metadataKey: 'pokemon_teams_metadata',
    maxTeamsLocal: 50, // Switch to IndexedDB after this limit
  },
  indexedDB: {
    name: 'PokemonTeamBuilderDB',
    version: 1,
    stores: {
      teams: 'teams',
      metadata: 'metadata',
      exports: 'exports',
      backups: 'backups'
    }
  }
};

// Team metadata interface for efficient listing
interface TeamMetadata {
  id: string;
  name: string;
  format?: string;
  generation: number;
  pokemonCount: number;
  created_at: Date;
  updated_at: Date;
  size: number; // Size in bytes
  storage: 'localStorage' | 'indexedDB';
}

interface TeamsMetadata {
  teams: TeamMetadata[];
  totalTeams: number;
  localStorageTeams: number;
  indexedDBTeams: number;
  lastModified: Date;
  version: string;
}

// Storage statistics
interface StorageStats {
  totalTeams: number;
  localStorageTeams: number;
  indexedDBTeams: number;
  totalSizeBytes: number;
  lastBackup?: Date;
  quotaUsed: number; // Percentage of storage quota used
  availableSpace: number; // Remaining space in bytes
}

// Team import/export interfaces
interface TeamExportOptions {
  includeMetadata?: boolean;
  format?: 'json' | 'showdown' | 'pokepaste';
  compress?: boolean;
}

interface TeamImportResult {
  success: boolean;
  team?: Team;
  errors: string[];
  warnings: string[];
  originalFormat: string;
}

// Backup system
interface TeamBackup {
  id: string;
  teamId: string;
  timestamp: Date;
  team: Team;
  reason: 'manual' | 'auto' | 'beforeEdit' | 'beforeDelete';
}

export class TeamStorageService {
  private db: IDBDatabase | null = null;
  private dbInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initializeIndexedDB();
  }

  /**
   * Initialize IndexedDB for advanced storage capabilities
   */
  private async initializeIndexedDB(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      const request = indexedDB.open(
        STORAGE_CONFIG.indexedDB.name,
        STORAGE_CONFIG.indexedDB.version
      );

      request.onerror = () => {
        console.warn('IndexedDB initialization failed, falling back to localStorage only');
        resolve(); // Don't reject, just use localStorage
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.dbInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.indexedDB.stores.teams)) {
          const teamStore = db.createObjectStore(STORAGE_CONFIG.indexedDB.stores.teams, {
            keyPath: 'id'
          });
          teamStore.createIndex('name', 'name', { unique: false });
          teamStore.createIndex('format', 'format', { unique: false });
          teamStore.createIndex('generation', 'generation', { unique: false });
          teamStore.createIndex('created_at', 'created_at', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORAGE_CONFIG.indexedDB.stores.metadata)) {
          db.createObjectStore(STORAGE_CONFIG.indexedDB.stores.metadata, {
            keyPath: 'id'
          });
        }

        if (!db.objectStoreNames.contains(STORAGE_CONFIG.indexedDB.stores.exports)) {
          db.createObjectStore(STORAGE_CONFIG.indexedDB.stores.exports, {
            keyPath: 'id'
          });
        }

        if (!db.objectStoreNames.contains(STORAGE_CONFIG.indexedDB.stores.backups)) {
          const backupStore = db.createObjectStore(STORAGE_CONFIG.indexedDB.stores.backups, {
            keyPath: 'id'
          });
          backupStore.createIndex('teamId', 'teamId', { unique: false });
          backupStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generate unique team ID
   */
  private generateTeamId(): string {
    return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate team size in bytes
   */
  private calculateTeamSize(team: Team): number {
    return new Blob([JSON.stringify(team)]).size;
  }

  /**
   * Validate team data
   */
  private validateTeam(team: Team): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!team.name || team.name.trim().length === 0) {
      errors.push('Team name is required');
    }

    if (!team.generation || team.generation < 1 || team.generation > 9) {
      errors.push('Invalid generation specified');
    }

    if (!team.pokemon || !Array.isArray(team.pokemon) || team.pokemon.length !== 6) {
      errors.push('Team must have exactly 6 Pokemon slots');
    }

    // Validate each Pokemon slot
    team.pokemon?.forEach((pokemon, index) => {
      if (pokemon) {
        if (!pokemon.species) {
          errors.push(`Pokemon in slot ${index + 1} missing species`);
        }
        if (pokemon.level < 1 || pokemon.level > 100) {
          errors.push(`Pokemon in slot ${index + 1} has invalid level`);
        }
        if (!pokemon.moves || pokemon.moves.length !== 4) {
          errors.push(`Pokemon in slot ${index + 1} must have exactly 4 move slots`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Save team to appropriate storage (localStorage or IndexedDB)
   */
  async saveTeam(team: Team): Promise<{ success: boolean; teamId?: string; error?: string }> {
    try {
      await this.initializeIndexedDB();

      // Validate team
      const validation = this.validateTeam(team);
      if (!validation.valid) {
        return {
          success: false,
          error: `Team validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Generate ID if new team
      if (!team.id) {
        team.id = this.generateTeamId();
      }

      // Set timestamps
      const now = new Date();
      if (!team.created_at) {
        team.created_at = now;
      }
      team.updated_at = now;

      // Create backup before saving (if team exists)
      const existingTeam = await this.getTeam(team.id);
      if (existingTeam) {
        await this.createBackup(team.id, existingTeam, 'beforeEdit');
      }

      // Calculate size and determine storage method
      const teamSize = this.calculateTeamSize(team);
      const metadata = await this.getTeamsMetadata();

      // Use IndexedDB for large teams or if we exceed localStorage limit
      const shouldUseIndexedDB = teamSize > 50000 || // Teams larger than 50KB
                                 metadata.localStorageTeams >= STORAGE_CONFIG.localStorage.maxTeamsLocal ||
                                 !this.isLocalStorageAvailable();

      let storage: 'localStorage' | 'indexedDB';

      if (shouldUseIndexedDB && this.dbInitialized) {
        // Save to IndexedDB
        storage = 'indexedDB';
        const transaction = this.db!.transaction([STORAGE_CONFIG.indexedDB.stores.teams], 'readwrite');
        const store = transaction.objectStore(STORAGE_CONFIG.indexedDB.stores.teams);

        await new Promise<void>((resolve, reject) => {
          const request = store.put(team);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } else {
        // Save to localStorage
        storage = 'localStorage';
        const key = `${STORAGE_CONFIG.localStorage.teamPrefix}${team.id}`;
        localStorage.setItem(key, JSON.stringify(team));
      }

      // Update metadata
      await this.updateTeamMetadata(team, storage);

      return {
        success: true,
        teamId: team.id
      };

    } catch (error) {
      console.error('Error saving team:', error);
      return {
        success: false,
        error: `Failed to save team: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Load team by ID from appropriate storage
   */
  async getTeam(teamId: string): Promise<Team | null> {
    try {
      await this.initializeIndexedDB();

      // Check localStorage first (faster)
      const localKey = `${STORAGE_CONFIG.localStorage.teamPrefix}${teamId}`;
      const localData = localStorage.getItem(localKey);

      if (localData) {
        try {
          return JSON.parse(localData) as Team;
        } catch (error) {
          console.warn(`Failed to parse team from localStorage: ${error}`);
        }
      }

      // Check IndexedDB if available
      if (this.dbInitialized) {
        const transaction = this.db!.transaction([STORAGE_CONFIG.indexedDB.stores.teams], 'readonly');
        const store = transaction.objectStore(STORAGE_CONFIG.indexedDB.stores.teams);

        return new Promise<Team | null>((resolve) => {
          const request = store.get(teamId);
          request.onsuccess = () => {
            resolve(request.result || null);
          };
          request.onerror = () => {
            console.warn(`Failed to get team from IndexedDB: ${request.error}`);
            resolve(null);
          };
        });
      }

      return null;
    } catch (error) {
      console.error(`Error loading team ${teamId}:`, error);
      return null;
    }
  }

  /**
   * Get all teams metadata for library display
   */
  async getAllTeams(): Promise<TeamMetadata[]> {
    try {
      const metadata = await this.getTeamsMetadata();
      return metadata.teams.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (error) {
      console.error('Error loading teams metadata:', error);
      return [];
    }
  }

  /**
   * Delete team from storage
   */
  async deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initializeIndexedDB();

      // Create backup before deletion
      const team = await this.getTeam(teamId);
      if (team) {
        await this.createBackup(teamId, team, 'beforeDelete');
      }

      // Delete from localStorage
      const localKey = `${STORAGE_CONFIG.localStorage.teamPrefix}${teamId}`;
      localStorage.removeItem(localKey);

      // Delete from IndexedDB if available
      if (this.dbInitialized) {
        const transaction = this.db!.transaction([STORAGE_CONFIG.indexedDB.stores.teams], 'readwrite');
        const store = transaction.objectStore(STORAGE_CONFIG.indexedDB.stores.teams);
        store.delete(teamId);
      }

      // Update metadata
      await this.removeTeamFromMetadata(teamId);

      return { success: true };
    } catch (error) {
      console.error(`Error deleting team ${teamId}:`, error);
      return {
        success: false,
        error: `Failed to delete team: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Duplicate team with new ID
   */
  async duplicateTeam(teamId: string, newName?: string): Promise<{ success: boolean; teamId?: string; error?: string }> {
    try {
      const originalTeam = await this.getTeam(teamId);
      if (!originalTeam) {
        return { success: false, error: 'Team not found' };
      }

      // Create new team with modified data
      const duplicatedTeam: Team = {
        ...originalTeam,
        id: this.generateTeamId(),
        name: newName || `${originalTeam.name} (Copy)`,
        created_at: new Date(),
        updated_at: new Date()
      };

      return await this.saveTeam(duplicatedTeam);
    } catch (error) {
      console.error(`Error duplicating team ${teamId}:`, error);
      return {
        success: false,
        error: `Failed to duplicate team: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Export team to various formats
   */
  async exportTeam(teamId: string, options: TeamExportOptions = {}): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const team = await this.getTeam(teamId);
      if (!team) {
        return { success: false, error: 'Team not found' };
      }

      const { format = 'json', includeMetadata = true, compress = false } = options;

      let exportData: string;

      switch (format) {
        case 'json': {
          const jsonExport: JSONExportData = {
            version: '1.0',
            exportedAt: new Date(),
            team,
            metadata: includeMetadata ? {
              appVersion: '1.0.0',
              formatVersion: '1.0'
            } : undefined
          };
          exportData = JSON.stringify(jsonExport, null, compress ? 0 : 2);
          break;
        }

        case 'showdown':
          exportData = this.convertToShowdownFormat(team);
          break;

        case 'pokepaste':
          exportData = this.convertToPokePasteFormat(team);
          break;

        default:
          return { success: false, error: 'Unsupported export format' };
      }

      // Store export record if using IndexedDB
      if (this.dbInitialized) {
        const exportRecord = {
          id: `export_${teamId}_${Date.now()}`,
          teamId,
          format,
          timestamp: new Date(),
          size: new Blob([exportData]).size
        };

        const transaction = this.db!.transaction([STORAGE_CONFIG.indexedDB.stores.exports], 'readwrite');
        const store = transaction.objectStore(STORAGE_CONFIG.indexedDB.stores.exports);
        store.add(exportRecord);
      }

      return { success: true, data: exportData };
    } catch (error) {
      console.error(`Error exporting team ${teamId}:`, error);
      return {
        success: false,
        error: `Failed to export team: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Import team from various formats
   */
  async importTeam(data: string, format?: string): Promise<TeamImportResult> {
    try {
      let team: Team;
      let detectedFormat: string;

      // Auto-detect format if not specified
      if (!format) {
        if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
          detectedFormat = 'json';
        } else if (data.includes('|') || data.includes(' @ ') || data.includes('Ability: ') || data.includes('EVs: ')) {
          detectedFormat = 'showdown';
        } else {
          detectedFormat = 'unknown';
        }
      } else {
        detectedFormat = format;
      }

      switch (detectedFormat) {
        case 'json':
          team = this.parseJSONTeam(data);
          break;

        case 'showdown': {
          const showdownResult = this.parseShowdownTeam(data);
          if (!showdownResult.success) {
            return {
              success: false,
              errors: showdownResult.errors,
              warnings: showdownResult.warnings || [],
              originalFormat: detectedFormat
            };
          }
          team = showdownResult.team!;
          break;
        }

        default:
          return {
            success: false,
            errors: ['Unsupported or unrecognized import format'],
            warnings: [],
            originalFormat: detectedFormat
          };
      }

      // Validate imported team
      const validation = this.validateTeam(team);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: [],
          originalFormat: detectedFormat
        };
      }

      // Save imported team
      const saveResult = await this.saveTeam(team);
      if (!saveResult.success) {
        return {
          success: false,
          errors: [saveResult.error || 'Failed to save imported team'],
          warnings: [],
          originalFormat: detectedFormat
        };
      }

      return {
        success: true,
        team,
        errors: [],
        warnings: [],
        originalFormat: detectedFormat
      };

    } catch (error) {
      console.error('Error importing team:', error);
      return {
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        originalFormat: format || 'unknown'
      };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      const metadata = await this.getTeamsMetadata();

      // Calculate storage usage
      const estimate = await navigator.storage?.estimate?.() || { quota: 0, usage: 0 };
      const quotaUsed = estimate.quota ? (estimate.usage || 0) / estimate.quota * 100 : 0;
      const availableSpace = (estimate.quota || 0) - (estimate.usage || 0);

      // Calculate total size
      let totalSizeBytes = 0;
      for (const teamMeta of metadata.teams) {
        totalSizeBytes += teamMeta.size;
      }

      return {
        totalTeams: metadata.totalTeams,
        localStorageTeams: metadata.teams.filter(t => t.storage === 'localStorage').length,
        indexedDBTeams: metadata.teams.filter(t => t.storage === 'indexedDB').length,
        totalSizeBytes,
        quotaUsed,
        availableSpace
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalTeams: 0,
        localStorageTeams: 0,
        indexedDBTeams: 0,
        totalSizeBytes: 0,
        quotaUsed: 0,
        availableSpace: 0
      };
    }
  }

  /**
   * Create backup of team
   */
  async createBackup(teamId: string, team: Team, reason: TeamBackup['reason']): Promise<void> {
    if (!this.dbInitialized) return;

    try {
      const backup: TeamBackup = {
        id: `backup_${teamId}_${Date.now()}`,
        teamId,
        timestamp: new Date(),
        team,
        reason
      };

      const transaction = this.db!.transaction([STORAGE_CONFIG.indexedDB.stores.backups], 'readwrite');
      const store = transaction.objectStore(STORAGE_CONFIG.indexedDB.stores.backups);
      store.add(backup);

      // Clean old backups (keep last 10 per team)
      await this.cleanOldBackups(teamId);
    } catch (error) {
      console.warn(`Failed to create backup for team ${teamId}:`, error);
    }
  }

  /**
   * Clean old backups to prevent storage bloat
   */
  private async cleanOldBackups(teamId: string): Promise<void> {
    if (!this.dbInitialized) return;

    try {
      const transaction = this.db!.transaction([STORAGE_CONFIG.indexedDB.stores.backups], 'readwrite');
      const store = transaction.objectStore(STORAGE_CONFIG.indexedDB.stores.backups);
      const index = store.index('teamId');

      const backups: TeamBackup[] = [];
      const request = index.openCursor(IDBKeyRange.only(teamId));

      await new Promise<void>((resolve) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            backups.push(cursor.value);
            cursor.continue();
          } else {
            resolve();
          }
        };
      });

      // Keep only the 10 most recent backups
      if (backups.length > 10) {
        backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const toDelete = backups.slice(10);

        for (const backup of toDelete) {
          store.delete(backup.id);
        }
      }
    } catch (error) {
      console.warn(`Failed to clean old backups for team ${teamId}:`, error);
    }
  }

  // Helper methods for metadata management
  private async getTeamsMetadata(): Promise<TeamsMetadata> {
    const localData = localStorage.getItem(STORAGE_CONFIG.localStorage.metadataKey);

    if (localData) {
      try {
        const metadata = JSON.parse(localData) as TeamsMetadata;
        // Convert date strings back to Date objects
        metadata.lastModified = new Date(metadata.lastModified);
        metadata.teams.forEach(team => {
          team.created_at = new Date(team.created_at);
          team.updated_at = new Date(team.updated_at);
        });
        return metadata;
      } catch (error) {
        console.warn('Failed to parse teams metadata:', error);
      }
    }

    // Return empty metadata if none exists or parsing failed
    return {
      teams: [],
      totalTeams: 0,
      localStorageTeams: 0,
      indexedDBTeams: 0,
      lastModified: new Date(),
      version: '1.0'
    };
  }

  private async updateTeamMetadata(team: Team, storage: 'localStorage' | 'indexedDB'): Promise<void> {
    try {
      const metadata = await this.getTeamsMetadata();

      // Remove existing entry if updating
      metadata.teams = metadata.teams.filter(t => t.id !== team.id);

      // Add/update team metadata
      const teamMetadata: TeamMetadata = {
        id: team.id!,
        name: team.name,
        format: team.format,
        generation: team.generation,
        pokemonCount: team.pokemon.filter(p => p !== null).length,
        created_at: team.created_at!,
        updated_at: team.updated_at!,
        size: this.calculateTeamSize(team),
        storage
      };

      metadata.teams.push(teamMetadata);
      metadata.totalTeams = metadata.teams.length;
      metadata.lastModified = new Date();

      localStorage.setItem(STORAGE_CONFIG.localStorage.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update team metadata:', error);
    }
  }

  private async removeTeamFromMetadata(teamId: string): Promise<void> {
    try {
      const metadata = await this.getTeamsMetadata();
      metadata.teams = metadata.teams.filter(t => t.id !== teamId);
      metadata.totalTeams = metadata.teams.length;
      metadata.lastModified = new Date();

      localStorage.setItem(STORAGE_CONFIG.localStorage.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to remove team from metadata:', error);
    }
  }

  // Helper methods for format conversion
  private convertToShowdownFormat(team: Team): string {
    let output = `=== [gen${team.generation}] ${team.name} ===\n\n`;

    team.pokemon.forEach((pokemon) => {
      if (!pokemon?.species) return;

      output += `${pokemon.nickname || pokemon.species}`;
      if (pokemon.gender && pokemon.gender !== 'N') {
        output += ` (${pokemon.gender})`;
      }
      if (pokemon.item) {
        output += ` @ ${pokemon.item}`;
      }
      output += '\n';

      if (pokemon.ability) {
        output += `Ability: ${pokemon.ability}\n`;
      }

      if (pokemon.level !== 50) {
        output += `Level: ${pokemon.level}\n`;
      }

      if (pokemon.shiny) {
        output += 'Shiny: Yes\n';
      }

      // EVs
      const evs = Object.entries(pokemon.evs)
        .filter(([, value]) => value > 0)
        .map(([stat, value]) => `${value} ${stat.replace('special-', 'Sp. ').replace('-', ' ')}`)
        .join(' / ');
      if (evs) {
        output += `EVs: ${evs}\n`;
      }

      if (pokemon.nature) {
        output += `${pokemon.nature} Nature\n`;
      }

      // IVs (only if not perfect)
      const ivs = Object.entries(pokemon.ivs)
        .filter(([, value]) => value < 31)
        .map(([stat, value]) => `${value} ${stat.replace('special-', 'Sp. ').replace('-', ' ')}`)
        .join(' / ');
      if (ivs) {
        output += `IVs: ${ivs}\n`;
      }

      // Moves
      pokemon.moves.forEach((move) => {
        if (move) {
          output += `- ${move}\n`;
        }
      });

      output += '\n';
    });

    return output.trim();
  }

  private convertToPokePasteFormat(team: Team): string {
    // Similar to Showdown but with slight formatting differences
    return this.convertToShowdownFormat(team);
  }

  private parseJSONTeam(data: string): Team {
    try {
      const parsed = JSON.parse(data);

      // Handle different JSON formats
      if (parsed.team) {
        // JSONExportData format
        return parsed.team as Team;
      } else if (parsed.pokemon && Array.isArray(parsed.pokemon)) {
        // Direct team format
        return parsed as Team;
      } else {
        throw new Error('Invalid JSON team format');
      }
    } catch (error) {
      throw new Error(`Failed to parse JSON team: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  private parseShowdownTeam(data: string): ShowdownImportResult {
    // This is a simplified parser - a full implementation would be more robust
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const lines = data.split('\n').map(line => line.trim()).filter(line => line);
      const team: Team = {
        id: this.generateTeamId(),
        name: 'Imported Team',
        generation: 8, // Default to gen 8, should be parsed from data
        pokemon: [null, null, null, null, null, null],
        created_at: new Date(),
        updated_at: new Date()
      };

      // Parse team name if present
      const titleMatch = data.match(/=== \[gen(\d+)\] (.+) ===/);
      if (titleMatch) {
        team.generation = parseInt(titleMatch[1]);
        team.name = titleMatch[2];
      }

      let currentPokemon: TeamPokemon | null = null;
      let pokemonIndex = 0;

      for (const line of lines) {
        if (line.startsWith('===') || line === '') continue;

        // New Pokemon (species line)
        if (!line.startsWith('-') && !line.includes(':') && pokemonIndex < 6) {
          if (currentPokemon) {
            team.pokemon[pokemonIndex] = currentPokemon;
            pokemonIndex++;
          }

          // Parse species line: "Pikachu (M) @ Light Ball"
          const speciesMatch = line.match(/^(.+?)(?:\s+\(([MF])\))?(?:\s+@\s+(.+))?$/);
          if (speciesMatch) {
            currentPokemon = {
              species: speciesMatch[1].trim(),
              gender: (speciesMatch[2] as 'M' | 'F') || undefined,
              item: speciesMatch[3]?.trim(),
              level: 50,
              shiny: false,
              moves: [null, null, null, null],
              evs: {
                hp: 0,
                attack: 0,
                defense: 0,
                'special-attack': 0,
                'special-defense': 0,
                speed: 0
              },
              ivs: {
                hp: 31,
                attack: 31,
                defense: 31,
                'special-attack': 31,
                'special-defense': 31,
                speed: 31
              },
              happiness: 255
            };
          }
        }
        // Ability line
        else if (line.startsWith('Ability:') && currentPokemon) {
          currentPokemon.ability = line.replace('Ability:', '').trim();
        }
        // Level line
        else if (line.startsWith('Level:') && currentPokemon) {
          currentPokemon.level = parseInt(line.replace('Level:', '').trim());
        }
        // Shiny line
        else if (line.includes('Shiny:') && currentPokemon) {
          currentPokemon.shiny = line.includes('Yes');
        }
        // EVs line
        else if (line.startsWith('EVs:') && currentPokemon) {
          const evsText = line.replace('EVs:', '').trim();
          this.parseStatSpread(evsText, currentPokemon.evs);
        }
        // Nature line
        else if (line.includes('Nature') && currentPokemon) {
          currentPokemon.nature = line.replace('Nature', '').trim();
        }
        // IVs line
        else if (line.startsWith('IVs:') && currentPokemon) {
          const ivsText = line.replace('IVs:', '').trim();
          this.parseStatSpread(ivsText, currentPokemon.ivs);
        }
        // Move line
        else if (line.startsWith('-') && currentPokemon) {
          const move = line.substring(1).trim();
          const moveSlot = currentPokemon.moves.findIndex(m => m === null);
          if (moveSlot !== -1) {
            currentPokemon.moves[moveSlot] = move;
          } else {
            warnings.push(`Too many moves for ${currentPokemon.species}, ignoring: ${move}`);
          }
        }
      }

      // Add the last Pokemon
      if (currentPokemon && pokemonIndex < 6) {
        team.pokemon[pokemonIndex] = currentPokemon;
      }

      return {
        success: true,
        team,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Failed to parse Showdown team: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        errors,
        warnings
      };
    }
  }

  private parseStatSpread(text: string, stats: StatSpread): void {
    const parts = text.split('/').map(part => part.trim());

    for (const part of parts) {
      const match = part.match(/(\d+)\s+(.+)/);
      if (match) {
        const value = parseInt(match[1]);
        const statName = match[2].toLowerCase()
          .replace('sp. atk', 'special-attack')
          .replace('sp. def', 'special-defense')
          .replace('spa', 'special-attack')
          .replace('spd', 'special-defense')
          .replace('spe', 'speed')
          .replace('att', 'attack')
          .replace('def', 'defense');

        // Type-safe assignment using specific stat names
        switch (statName) {
          case 'hp':
            stats.hp = value;
            break;
          case 'attack':
            stats.attack = value;
            break;
          case 'defense':
            stats.defense = value;
            break;
          case 'special-attack':
            stats['special-attack'] = value;
            break;
          case 'special-defense':
            stats['special-defense'] = value;
            break;
          case 'speed':
            stats.speed = value;
            break;
        }
      }
    }
  }

  /**
   * Check if localStorage is available and working
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Search teams by name, format, or generation
   */
  async searchTeams(query: string): Promise<TeamMetadata[]> {
    try {
      const allTeams = await this.getAllTeams();
      const lowercaseQuery = query.toLowerCase();

      return allTeams.filter(team =>
        team.name.toLowerCase().includes(lowercaseQuery) ||
        team.format?.toLowerCase().includes(lowercaseQuery) ||
        team.generation.toString().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching teams:', error);
      return [];
    }
  }

  /**
   * Get teams by generation
   */
  async getTeamsByGeneration(generation: number): Promise<TeamMetadata[]> {
    try {
      const allTeams = await this.getAllTeams();
      return allTeams.filter(team => team.generation === generation);
    } catch (error) {
      console.error('Error filtering teams by generation:', error);
      return [];
    }
  }

  /**
   * Get teams by format
   */
  async getTeamsByFormat(format: string): Promise<TeamMetadata[]> {
    try {
      const allTeams = await this.getAllTeams();
      return allTeams.filter(team => team.format === format);
    } catch (error) {
      console.error('Error filtering teams by format:', error);
      return [];
    }
  }
}

// Create singleton instance
export const teamStorageService = new TeamStorageService();
export type { TeamMetadata, TeamsMetadata, StorageStats, TeamExportOptions, TeamImportResult };