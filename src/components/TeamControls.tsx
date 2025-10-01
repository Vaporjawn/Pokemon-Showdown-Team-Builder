import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { Shuffle as RandomIcon, Upload as ImportIcon, Download as ExportIcon } from '@mui/icons-material';
import { useTeamStore } from '../stores/teamStore';
import TeamImportDialog from './TeamImportDialog';
import TeamExportDialog from './TeamExportDialog';

const TeamControls: React.FC = () => {
  const {
    currentTeam,
    generation,
    currentFormat,
    setGeneration,
    setFormat,
    createNewTeam,
    resetTeam,
  } = useTeamStore();

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleTeamNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // We'll implement team name update later
    console.log('Team name change:', event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Team Name */}
      <TextField
        label="Team Name"
        value={currentTeam.name}
        onChange={handleTeamNameChange}
        size="small"
        sx={{ minWidth: 200 }}
      />

      {/* Generation Selector */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Generation</InputLabel>
        <Select
          value={generation}
          label="Generation"
          onChange={(e) => setGeneration(Number(e.target.value))}
        >
          {Array.from({ length: 9 }, (_, i) => i + 1).map((gen) => (
            <MenuItem key={gen} value={gen}>
              Gen {gen}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Format Selector */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Format</InputLabel>
        <Select
          value={currentFormat}
          label="Format"
          onChange={(e) => setFormat(e.target.value)}
        >
          <MenuItem value={`gen${generation}ou`}>OU</MenuItem>
          <MenuItem value={`gen${generation}uu`}>UU</MenuItem>
          <MenuItem value={`gen${generation}ru`}>RU</MenuItem>
          <MenuItem value={`gen${generation}nu`}>NU</MenuItem>
          <MenuItem value={`gen${generation}pu`}>PU</MenuItem>
          <MenuItem value={`gen${generation}ubers`}>Ubers</MenuItem>
          <MenuItem value={`gen${generation}doublesou`}>Doubles OU</MenuItem>
        </Select>
      </FormControl>

      {/* Action Buttons */}
      <Button
        variant="outlined"
        size="small"
        onClick={createNewTeam}
      >
        New Team
      </Button>

      <Button
        variant="outlined"
        size="small"
        onClick={resetTeam}
      >
        Clear Team
      </Button>

      <Button
        variant="outlined"
        size="small"
        startIcon={<RandomIcon />}
      >
        Random Team
      </Button>

      <Button
        variant="outlined"
        size="small"
        startIcon={<ImportIcon />}
        onClick={() => setImportDialogOpen(true)}
      >
        Import
      </Button>

      <Button
        variant="outlined"
        size="small"
        startIcon={<ExportIcon />}
        onClick={() => setExportDialogOpen(true)}
      >
        Export
      </Button>

      {/* Import Dialog */}
      <TeamImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      />

      {/* Export Dialog */}
      <TeamExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
    </Box>
  );
};

export default TeamControls;
