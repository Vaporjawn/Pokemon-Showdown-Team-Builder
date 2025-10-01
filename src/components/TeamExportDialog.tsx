import React, { useState, useCallback, useEffect } from 'react';
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
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Code as CodeIcon,
  DataObject as JsonIcon,
} from '@mui/icons-material';
import { useTeamStore } from '../stores/teamStore';
import { teamStorageService } from '../services/teamStorageService';
import { exportTeamToShowdown } from '../utils/showdownFormat';


interface TeamExportDialogProps {
  open: boolean;
  onClose: () => void;
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
    id={`export-tabpanel-${index}`}
    aria-labelledby={`export-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const TeamExportDialog: React.FC<TeamExportDialogProps> = ({
  open,
  onClose,
}) => {
  const { currentTeam } = useTeamStore();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [showdownText, setShowdownText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [filename, setFilename] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [prettyFormat, setPrettyFormat] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate export data when dialog opens or team changes
  useEffect(() => {
    if (open && currentTeam) {
      // Generate Showdown format
      try {
        const showdown = exportTeamToShowdown(currentTeam);
        setShowdownText(showdown);
      } catch (error) {
        setShowdownText('Error generating Showdown format: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }

      // Generate JSON format
      try {
        const teamData = includeMetadata ? currentTeam : {
          name: currentTeam.name,
          generation: currentTeam.generation,
          format: currentTeam.format,
          pokemon: currentTeam.pokemon,
        };
        
        const json = prettyFormat 
          ? JSON.stringify(teamData, null, 2)
          : JSON.stringify(teamData);
        setJsonText(json);
      } catch (error) {
        setJsonText('Error generating JSON format: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }

      // Set default filename
      const teamName = currentTeam.name || 'MyTeam';
      const sanitizedName = teamName.replace(/[^a-zA-Z0-9-_]/g, '_');
      setFilename(sanitizedName);
    }
  }, [open, currentTeam, includeMetadata, prettyFormat]);

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    setCopySuccess(null);
    onClose();
  }, [onClose]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(format);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  // Download as file
  const downloadFile = useCallback((content: string, extension: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  }, [filename]);

  // Export using storage service
  const exportWithStorageService = useCallback(async (format: 'json' | 'showdown') => {
    if (!currentTeam) return;

    try {
      const result = await teamStorageService.exportTeam(currentTeam.id || 'current', {
        format,
        includeMetadata: includeMetadata,
      });
      
      if (result.success && result.data) {
        if (format === 'json') {
          downloadFile(result.data, 'json', 'application/json');
        } else {
          downloadFile(result.data, 'txt', 'text/plain');
        }
      } else {
        setError(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      setError('Export failed: ' + (error as Error).message);
    }
  }, [currentTeam, downloadFile, includeMetadata]);

  // Generate shareable link (mock implementation)
  const generateShareLink = useCallback(() => {
    if (!currentTeam) return;

    // In a real app, this would upload the team to a sharing service
    // For now, we'll create a data URL that could be used locally
    const teamData = encodeURIComponent(JSON.stringify(currentTeam));
    const shareUrl = `${window.location.origin}${window.location.pathname}#team=${teamData}`;
    
    copyToClipboard(shareUrl, 'Share Link');
  }, [currentTeam, copyToClipboard]);

  if (!currentTeam) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <DialogTitle>Export Team</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            No team to export. Please create or load a team first.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const activePokemonCount = currentTeam.pokemon.filter(p => p !== null).length;

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
          <DownloadIcon />
          <Typography variant="h6">Export Team</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, p: 0 }}>
        {/* Team Info */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Card>
            <CardContent sx={{ pb: '16px !important' }}>
              <Typography variant="h6" gutterBottom>
                {currentTeam.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`Generation ${currentTeam.generation}`} size="small" />
                {currentTeam.format && (
                  <Chip label={currentTeam.format.toUpperCase()} size="small" />
                )}
                <Chip 
                  label={`${activePokemonCount} Pokémon`} 
                  size="small" 
                  color={activePokemonCount === 6 ? 'success' : 'default'}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Error Display */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Pokémon Showdown" icon={<CodeIcon />} />
            <Tab label="JSON Format" icon={<JsonIcon />} />
            <Tab label="Share Options" icon={<ShareIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Pokémon Showdown team format - compatible with PS! and most team builders
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(showdownText, 'Showdown')}
                  startIcon={<CopyIcon />}
                  disabled={!showdownText}
                >
                  {copySuccess === 'Showdown' ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="small"
                  onClick={() => downloadFile(showdownText, 'txt', 'text/plain')}
                  startIcon={<DownloadIcon />}
                  disabled={!showdownText}
                >
                  Download
                </Button>
              </Box>
            </Box>
            <TextField
              multiline
              rows={12}
              value={showdownText}
              variant="outlined"
              fullWidth
              InputProps={{
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                JSON format - for programmatic use and backup
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(jsonText, 'JSON')}
                  startIcon={<CopyIcon />}
                  disabled={!jsonText}
                >
                  {copySuccess === 'JSON' ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="small"
                  onClick={() => exportWithStorageService('json')}
                  startIcon={<DownloadIcon />}
                  disabled={!currentTeam}
                >
                  Download
                </Button>
              </Box>
            </Box>
            
            {/* JSON Export Options */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                  />
                }
                label="Include metadata"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={prettyFormat}
                    onChange={(e) => setPrettyFormat(e.target.checked)}
                  />
                }
                label="Pretty format"
              />
            </Box>

            <TextField
              multiline
              rows={10}
              value={jsonText}
              variant="outlined"
              fullWidth
              InputProps={{
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Share your team with others
            </Typography>

            {/* Filename Configuration */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9-_]/g, '_'))}
                variant="outlined"
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Quick Export Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2">Quick Export</Typography>
              
              <Button
                variant="outlined"
                onClick={() => exportWithStorageService('showdown')}
                startIcon={<DownloadIcon />}
                disabled={!currentTeam}
                fullWidth
              >
                Download as Showdown (.txt)
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => exportWithStorageService('json')}
                startIcon={<DownloadIcon />}
                disabled={!currentTeam}
                fullWidth
              >
                Download as JSON (.json)
              </Button>
              
              <Button
                variant="outlined"
                onClick={generateShareLink}
                startIcon={<ShareIcon />}
                disabled={!currentTeam}
                fullWidth
              >
                {copySuccess === 'Share Link' ? 'Link Copied!' : 'Generate Share Link'}
              </Button>
            </Box>

            {activePokemonCount === 0 && (
              <Alert severity="warning">
                Your team is empty. Add some Pokémon before sharing.
              </Alert>
            )}

            {activePokemonCount > 0 && activePokemonCount < 6 && (
              <Alert severity="info">
                Your team has {activePokemonCount} Pokémon. Consider adding more for a complete team.
              </Alert>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamExportDialog;