import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  MonetizationOn as CoinIcon,
} from '@mui/icons-material';
import { pokemonDataService } from '../services/dataService';
import type { Item } from '../types/pokemon';

interface ItemEditorProps {
  open: boolean;
  onClose: () => void;
  onSelectItem: (itemName: string) => void;
  currentItem?: string;
}

interface ItemData {
  name: string;
  displayName: string;
  description: string;
  cost: number;
  category: string;
  sprite?: string;
}

const ItemEditor: React.FC<ItemEditorProps> = ({
  open,
  onClose,
  onSelectItem,
  currentItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<ItemData[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemData[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processItemData = useCallback(async (item: Item): Promise<ItemData> => {
    // Get English description
    const englishEffect = item.effect_entries.find(
      entry => entry.language.name === 'en'
    );
    const englishFlavorText = item.flavor_text_entries?.find(
      entry => entry.language.name === 'en'
    );

    const description = englishEffect?.effect || englishFlavorText?.text || 'No description available.';
    
    return {
      name: item.name,
      displayName: formatItemName(item.name),
      description: description,
      cost: item.cost || 0,
      category: item.category?.name || 'unknown',
      sprite: item.sprites?.default || undefined,
    };
  }, []);

  const loadItemsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get item names from the data service
      const itemNames = pokemonDataService.searchItems('').slice(0, 100); // Load first 100 items
      const itemsData: ItemData[] = [];

      for (const itemName of itemNames) {
        try {
          const item = await pokemonDataService.getItem(itemName);
          if (item) {
            const itemData = await processItemData(item);
            itemsData.push(itemData);
          }
        } catch (err) {
          console.warn(`Failed to load item ${itemName}:`, err);
        }
      }

      // Sort by category and then by name
      itemsData.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.displayName.localeCompare(b.displayName);
      });

      setItems(itemsData);
      setFilteredItems(itemsData);
    } catch (err) {
      setError('Failed to load items data. Please try again.');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, [processItemData]);

  // Load items data when dialog opens
  useEffect(() => {
    if (open) {
      loadItemsData();
    }
  }, [open, loadItemsData]);

  // Filter items when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const formatItemName = (name: string): string => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCategory = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleItemSelect = (item: ItemData) => {
    setSelectedItem(item);
  };

  const handleConfirmSelection = () => {
    if (selectedItem) {
      onSelectItem(selectedItem.name);
      onClose();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const getCategoryColor = (category: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (category) {
      case 'held-items':
      case 'choice':
        return 'primary';
      case 'healing':
      case 'medicine':
        return 'success';
      case 'pokeballs':
        return 'info';
      case 'battle-items':
      case 'stat-boosts':
        return 'warning';
      case 'berries':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ItemData[]>);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Item Editor</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 0 }}>
        {/* Search Section */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search items by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading items...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* Items List */}
            <Box sx={{ width: '50%', borderRight: 1, borderColor: 'divider' }}>
              <List sx={{ height: '100%', overflow: 'auto' }}>
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <Box key={category}>
                    <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {formatCategory(category)} ({categoryItems.length})
                      </Typography>
                    </Box>
                    {categoryItems.map((item) => (
                      <ListItem key={item.name} disablePadding>
                        <ListItemButton
                          selected={selectedItem?.name === item.name}
                          onClick={() => handleItemSelect(item)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            {item.sprite && (
                              <Avatar
                                src={item.sprite}
                                alt={item.displayName}
                                sx={{ width: 24, height: 24 }}
                                variant="square"
                              />
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" noWrap>
                                      {item.displayName}
                                    </Typography>
                                    {item.cost > 0 && (
                                      <Chip
                                        icon={<CoinIcon />}
                                        label={`₽${item.cost}`}
                                        size="small"
                                        variant="outlined"
                                        color={getCategoryColor(category)}
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={item.description.substring(0, 60) + '...'}
                              />
                            </Box>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    ))}
                    <Divider />
                  </Box>
                ))}

                {filteredItems.length === 0 && !loading && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      {searchQuery ? 'No items found matching your search.' : 'No items available.'}
                    </Typography>
                  </Box>
                )}
              </List>
            </Box>

            {/* Item Details */}
            <Box sx={{ width: '50%', p: 2, display: 'flex', flexDirection: 'column' }}>
              {selectedItem ? (
                <Fade in={true}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {selectedItem.sprite && (
                        <Avatar
                          src={selectedItem.sprite}
                          alt={selectedItem.displayName}
                          sx={{ width: 48, height: 48 }}
                          variant="square"
                        />
                      )}
                      <Box>
                        <Typography variant="h6">
                          {selectedItem.displayName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={formatCategory(selectedItem.category)}
                            color={getCategoryColor(selectedItem.category)}
                            size="small"
                          />
                          {selectedItem.cost > 0 && (
                            <Chip
                              icon={<CoinIcon />}
                              label={`₽${selectedItem.cost.toLocaleString()}`}
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Internal Name: {selectedItem.name}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {selectedItem.description}
                    </Typography>

                    {selectedItem.cost === 0 && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        This item cannot be purchased in shops.
                      </Alert>
                    )}

                    {currentItem && currentItem === selectedItem.name && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        This is the currently selected item.
                      </Alert>
                    )}
                  </Box>
                </Fade>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <VisibilityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" align="center">
                    Select an item to view its details
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Items are grouped by category and show their shop prices
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirmSelection}
          disabled={!selectedItem}
        >
          Select Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemEditor;