import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
  Casino as CasinoIcon,
} from '@mui/icons-material';
import { useTeamStore } from '../stores/teamStore';
import { exportTeamToShowdown, importTeamFromShowdown, isValidShowdownFormat } from '../utils/showdownFormat';
import { RandomTeamDialog } from './RandomTeamDialog';

export const TeamActions: React.FC = () => {
  const { currentTeam, setTeam, updateTeamName } = useTeamStore();

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [randomTeamDialogOpen, setRandomTeamDialogOpen] = useState(false);

  // Form states
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleImportOpen = () => {
    setImportText('');
    setError(null);
    setImportDialogOpen(true);
    handleMenuClose();
  };

  const handleExportOpen = () => {
    if (!currentTeam) return;

    const showdownFormat = exportTeamToShowdown(currentTeam);
    setExportText(showdownFormat);
    setExportDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveOpen = () => {
    setTeamName(currentTeam?.name || 'My Team');
    setSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleImport = () => {
    try {
      if (!importText.trim()) {
        setError('Please paste a team in Pokémon Showdown format');
        return;
      }

      if (!isValidShowdownFormat(importText)) {
        setError('Invalid Pokémon Showdown format. Please check your team format.');
        return;
      }

      const importedTeam = importTeamFromShowdown(importText);
      setTeam(importedTeam);
      setImportDialogOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to import team. Please check the format and try again.');
      console.error('Import error:', err);
    }
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      // Could add a success toast here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleSave = () => {
    if (!currentTeam) return;

    try {
      // Save to localStorage
      const savedTeams = JSON.parse(localStorage.getItem('pokemon-teams') || '[]');
      const teamToSave = {
        ...currentTeam,
        name: teamName,
        id: currentTeam.id || `team-${Date.now()}`,
        savedAt: new Date().toISOString(),
      };

      // Check if team already exists (by ID) and update it
      const existingIndex = savedTeams.findIndex((team: { id: string }) => team.id === teamToSave.id);
      if (existingIndex >= 0) {
        savedTeams[existingIndex] = teamToSave;
      } else {
        savedTeams.push(teamToSave);
      }

      localStorage.setItem('pokemon-teams', JSON.stringify(savedTeams));
      updateTeamName(teamName);
      setSaveDialogOpen(false);

      // Could add a success toast here
    } catch (err) {
      setError('Failed to save team. Please try again.');
      console.error('Save error:', err);
    }
  };

  const handleLoadTeam = () => {
    // This would open a team selection dialog
    // For now, we'll just log that it was clicked
    console.log('Load team clicked - would show team selection dialog');
    handleMenuClose();
  };

  const handleRandomTeam = () => {
    setRandomTeamDialogOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleImportOpen}
        >
          Import
        </Button>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportOpen}
          disabled={!currentTeam}
        >
          Export
        </Button>

        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* More Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSaveOpen} disabled={!currentTeam}>
          <SaveIcon sx={{ mr: 1 }} />
          Save Team
        </MenuItem>
        <MenuItem onClick={handleLoadTeam}>
          <FolderOpenIcon sx={{ mr: 1 }} />
          Load Team
        </MenuItem>
        <MenuItem onClick={handleRandomTeam}>
          <CasinoIcon sx={{ mr: 1 }} />
          Random Team
        </MenuItem>
      </Menu>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Team from Pokémon Showdown</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Paste your team in Pokémon Showdown format below:
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder={`Example format:\n\nCharizard @ Life Orb\nAbility: Solar Power\nEVs: 252 SpA / 4 SpD / 252 Spe\nTimid Nature\n- Flamethrower\n- Solar Beam\n- Air Slash\n- Roost`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!importText.trim()}
          >
            Import Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Export Team to Pokémon Showdown</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Copy this team format to use in Pokémon Showdown:
            </Typography>
          </Box>

          <TextField
            multiline
            rows={12}
            fullWidth
            value={exportText}
            InputProps={{
              readOnly: true,
            }}
            sx={{
              fontFamily: 'monospace',
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            Close
          </Button>
          <Button
            onClick={handleCopyExport}
            variant="contained"
          >
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Team Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Team</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!teamName.trim()}
          >
            Save Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Random Team Dialog */}
      <RandomTeamDialog
        open={randomTeamDialogOpen}
        onClose={() => setRandomTeamDialogOpen(false)}
      />
    </>
  );
};
