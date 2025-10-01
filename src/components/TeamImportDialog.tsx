import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  ContentPaste as PasteIcon,
  Link as LinkIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useTeamStore } from '../stores/teamStore';
import { teamStorageService, type TeamImportResult } from '../services/teamStorageService';
import { isValidShowdownFormat, getSampleShowdownTeam } from '../utils/showdownFormat';
import type { Team } from '../types/team';

interface TeamImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess?: (team: Team) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`import-tabpanel-${index}`}
    aria-labelledby={`import-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const TeamImportDialog: React.FC<TeamImportDialogProps> = ({
  open,
  onClose,
  onImportSuccess,
}) => {
  const { importTeam, setError } = useTeamStore();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [showdownText, setShowdownText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<TeamImportResult | null>(null);
  const [previewTeam, setPreviewTeam] = useState<Team | null>(null);

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    setShowdownText('');
    setJsonText('');
    setUrlInput('');
    setImportResult(null);
    setPreviewTeam(null);
    setCurrentTab(0);
    onClose();
  }, [onClose]);

  // Import from Showdown format
  const handleShowdownImport = useCallback(async () => {
    if (!showdownText.trim()) {
      setImportResult({
        success: false,
        errors: ['Please enter a Pokémon Showdown team'],
        warnings: [],
        originalFormat: 'showdown'
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Validate format first
      if (!isValidShowdownFormat(showdownText)) {
        setImportResult({
          success: false,
          errors: ['Invalid Pokémon Showdown format. Please check your team data.'],
          warnings: [],
          originalFormat: 'showdown'
        });
        return;
      }

      // Use storage service for validation and import
      const result = await teamStorageService.importTeam(showdownText, 'showdown');
      
      if (result.success && result.team) {
        setPreviewTeam(result.team);
        setImportResult(result);
      } else {
        setImportResult(result);
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        originalFormat: 'showdown'
      });
    } finally {
      setIsImporting(false);
    }
  }, [showdownText]);

  // Import from JSON format
  const handleJsonImport = useCallback(async () => {
    if (!jsonText.trim()) {
      setImportResult({
        success: false,
        errors: ['Please enter a JSON team'],
        warnings: [],
        originalFormat: 'json'
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await teamStorageService.importTeam(jsonText, 'json');
      
      if (result.success && result.team) {
        setPreviewTeam(result.team);
        setImportResult(result);
      } else {
        setImportResult(result);
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        originalFormat: 'json'
      });
    } finally {
      setIsImporting(false);
    }
  }, [jsonText]);

  // Import from URL
  const handleUrlImport = useCallback(async () => {
    if (!urlInput.trim()) {
      setImportResult({
        success: false,
        errors: ['Please enter a valid URL'],
        warnings: [],
        originalFormat: 'url'
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Fetch team data from URL
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      
      // Try to determine format and import
      let result: TeamImportResult;
      
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        result = await teamStorageService.importTeam(text, 'json');
      } else {
        result = await teamStorageService.importTeam(text, 'showdown');
      }

      if (result.success && result.team) {
        setPreviewTeam(result.team);
        setImportResult(result);
      } else {
        setImportResult(result);
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`URL import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        originalFormat: 'url'
      });
    } finally {
      setIsImporting(false);
    }
  }, [urlInput]);

  // Confirm import - apply to current team
  const handleConfirmImport = useCallback(() => {
    if (previewTeam) {
      importTeam(previewTeam);
      onImportSuccess?.(previewTeam);
      handleClose();
    }
  }, [previewTeam, importTeam, onImportSuccess, handleClose]);

  // Load sample team for demonstration
  const loadSampleTeam = useCallback(() => {
    const sampleTeam = getSampleShowdownTeam();
    setShowdownText(sampleTeam);
    setCurrentTab(0); // Switch to Showdown tab
  }, []);

  // Paste from clipboard
  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      // Auto-detect format and set appropriate tab
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        setJsonText(text);
        setCurrentTab(1);
      } else if (text.includes('http://') || text.includes('https://')) {
        setUrlInput(text);
        setCurrentTab(2);
      } else {
        setShowdownText(text);
        setCurrentTab(0);
      }
    } catch {
      setError('Failed to paste from clipboard. Please paste manually.');
    }
  }, [setError]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon />
          <Typography variant="h6">Import Team</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Paste from clipboard">
            <IconButton onClick={pasteFromClipboard} size="small">
              <PasteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Load sample team">
            <Button onClick={loadSampleTeam} size="small" variant="outlined">
              Sample
            </Button>
          </Tooltip>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Pokémon Showdown" icon={<Typography variant="caption">PS!</Typography>} />
            <Tab label="JSON Format" icon={<Typography variant="caption">{}</Typography>} />
            <Tab label="URL Import" icon={<LinkIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Paste your Pokémon Showdown team here
              </Typography>
              <Tooltip title="Learn about Pokémon Showdown format">
                <IconButton size="small" href="https://pokepast.es/" target="_blank">
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              multiline
              rows={12}
              value={showdownText}
              onChange={(e) => setShowdownText(e.target.value)}
              placeholder={`Charizard @ Life Orb
Ability: Solar Power
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
IVs: 0 Atk
- Flamethrower
- Solar Beam
- Air Slash
- Roost`}
              variant="outlined"
              fullWidth
              sx={{ fontFamily: 'monospace', flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleShowdownImport}
              disabled={isImporting || !showdownText.trim()}
              startIcon={isImporting ? <CircularProgress size={16} /> : <UploadIcon />}
              fullWidth
            >
              {isImporting ? 'Importing...' : 'Import Showdown Team'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Paste your JSON team data here
            </Typography>
            <TextField
              multiline
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`{
  "name": "My Team",
  "generation": 9,
  "pokemon": [...]
}`}
              variant="outlined"
              fullWidth
              sx={{ fontFamily: 'monospace', flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleJsonImport}
              disabled={isImporting || !jsonText.trim()}
              startIcon={isImporting ? <CircularProgress size={16} /> : <UploadIcon />}
              fullWidth
            >
              {isImporting ? 'Importing...' : 'Import JSON Team'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Import team from a URL (PokéPaste, team sharing sites, etc.)
            </Typography>
            <TextField
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://pokepast.es/123456789abcdef"
              variant="outlined"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleUrlImport}
              disabled={isImporting || !urlInput.trim()}
              startIcon={isImporting ? <CircularProgress size={16} /> : <LinkIcon />}
              fullWidth
            >
              {isImporting ? 'Importing...' : 'Import from URL'}
            </Button>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Supported URLs:</strong> PokéPaste, Hastebin, GitHub Gist, and any direct link to team data.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        {/* Import Results */}
        {importResult && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            {importResult.success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Import Successful!</Typography>
                <Typography variant="body2">
                  Team imported successfully from {importResult.originalFormat} format.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Import Failed</Typography>
                {importResult.errors.map((error, index) => (
                  <Typography key={index} variant="body2">• {error}</Typography>
                ))}
              </Alert>
            )}

            {importResult.warnings.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Warnings</Typography>
                {importResult.warnings.map((warning, index) => (
                  <Typography key={index} variant="body2">• {warning}</Typography>
                ))}
              </Alert>
            )}

            {/* Team Preview */}
            {previewTeam && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Preview: {previewTeam.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={`Generation ${previewTeam.generation}`} size="small" />
                    {previewTeam.format && (
                      <Chip label={previewTeam.format.toUpperCase()} size="small" />
                    )}
                    <Chip 
                      label={`${previewTeam.pokemon.filter(p => p !== null).length} Pokémon`} 
                      size="small" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {previewTeam.pokemon.map((pokemon, index) => (
                      pokemon ? (
                        <Chip
                          key={index}
                          label={pokemon.nickname || pokemon.species || 'Unknown'}
                          variant="outlined"
                          size="small"
                        />
                      ) : null
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirmImport}
          disabled={!previewTeam || !importResult?.success}
        >
          Import Team
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamImportDialog;