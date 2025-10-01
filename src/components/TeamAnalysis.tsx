import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  TipsAndUpdates as SuggestionIcon,
  Assessment as AnalysisIcon,
  Shield as DefenseIcon,
  Whatshot as AttackIcon,
  Speed as SpeedIcon,
  Psychology as SpecialIcon,
  ExpandMore as ExpandMoreIcon,
  Stars as RoleIcon,
  Insights as InsightIcon,
  BarChart as StatsIcon,
  AutoAwesome as SynergyIcon,
} from '@mui/icons-material';
import { useTeamStore } from '../stores/teamStore';
import { 
  teamAnalysisUtils, 
  type TeamSuggestion, 
  type TypeCoverage,
  type RoleAnalysis,
  type StatDistribution,
  type MoveCoverage,
  type CompetitiveViability
} from '../utils/teamAnalysis';
import PokemonTypeChip from './PokemonTypeChip';

// TabPanel component for managing tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-analysis-tabpanel-${index}`}
      aria-labelledby={`team-analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TeamAnalysis: React.FC = () => {
  const { currentTeam } = useTeamStore();
  const [typeCoverage, setTypeCoverage] = useState<TypeCoverage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Advanced analysis states
  const [roleAnalysis, setRoleAnalysis] = useState<RoleAnalysis | null>(null);
  const [statDistribution, setStatDistribution] = useState<StatDistribution | null>(null);
  const [moveCoverage, setMoveCoverage] = useState<MoveCoverage | null>(null);
  const [competitiveViability, setCompetitiveViability] = useState<CompetitiveViability | null>(null);

  const suggestions: TeamSuggestion[] = teamAnalysisUtils.getTeamSuggestions(currentTeam.pokemon);
  const hasSynergy = teamAnalysisUtils.hasGoodTypeSynergy(currentTeam.pokemon);

  // Load comprehensive team analysis asynchronously
  useEffect(() => {
    const loadAnalysis = async () => {
      setIsLoading(true);
      try {
        // Load all analysis types concurrently
        const [
          coverage,
          roles,
          stats,
          moves,
          viability
        ] = await Promise.all([
          teamAnalysisUtils.analyzeTypeCoverage(currentTeam.pokemon),
          teamAnalysisUtils.analyzeTeamRoles(currentTeam.pokemon),
          teamAnalysisUtils.analyzeStatDistribution(currentTeam.pokemon),
          teamAnalysisUtils.analyzeMoveCoverage(currentTeam.pokemon),
          teamAnalysisUtils.analyzeCompetitiveViability(currentTeam.pokemon)
        ]);

        setTypeCoverage(coverage);
        setRoleAnalysis(roles);
        setStatDistribution(stats);
        setMoveCoverage(moves);
        setCompetitiveViability(viability);
      } catch (error) {
        console.error('Failed to analyze team:', error);
        // Provide fallback coverage data
        setTypeCoverage({
          weak_to: [],
          strong_against: [],
          neutral_to: [],
          resists: [],
          coverage_score: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [currentTeam.pokemon]);

  // Show loading state while analyzing type coverage
  if (isLoading || !typeCoverage) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AnalysisIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Team Analysis</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AnalysisIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">Team Analysis</Typography>
      </Box>

      {currentTeam.pokemon.filter(p => p !== null).length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Add some Pokémon to your team to see comprehensive analysis!
          </Typography>
        </Box>
      ) : (
        <>
          {/* Team Synergy Alert */}
          {!hasSynergy && currentTeam.pokemon.filter(p => p !== null).length > 2 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Your team composition could be improved. Consider the suggestions below!
            </Alert>
          )}

          {/* Analysis Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={(_, newValue) => setCurrentTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<AnalysisIcon />} 
                label="Coverage" 
                id="team-analysis-tab-0"
                aria-controls="team-analysis-tabpanel-0"
              />
              <Tab 
                icon={<RoleIcon />} 
                label="Roles" 
                id="team-analysis-tab-1"
                aria-controls="team-analysis-tabpanel-1"
              />
              <Tab 
                icon={<StatsIcon />} 
                label="Stats" 
                id="team-analysis-tab-2"
                aria-controls="team-analysis-tabpanel-2"
              />
              <Tab 
                icon={<SynergyIcon />} 
                label="Moves" 
                id="team-analysis-tab-3"
                aria-controls="team-analysis-tabpanel-3"
              />
              <Tab 
                icon={<InsightIcon />} 
                label="Competitive" 
                id="team-analysis-tab-4"
                aria-controls="team-analysis-tabpanel-4"
              />
            </Tabs>
          </Box>

          {/* Tab Panel 0: Type Coverage */}
          <TabPanel value={currentTab} index={0}>
            {/* Coverage Score */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Type Coverage Analysis
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Overall Coverage Score: {Math.round(typeCoverage.coverage_score)}/100
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={typeCoverage.coverage_score}
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: typeCoverage.coverage_score > 70 ? 'success.main' :
                                       typeCoverage.coverage_score > 50 ? 'warning.main' : 'error.main'
                      }
                    }}
                  />
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  {/* Strong Against */}
                  {typeCoverage.resists.length > 0 && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.main' }}>
                        <DefenseIcon sx={{ fontSize: '1em', mr: 0.5 }} />
                        Strong Against ({typeCoverage.resists.length} types)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {typeCoverage.resists.map((type) => (
                          <PokemonTypeChip key={type} type={type} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Weak Against */}
                  {typeCoverage.weak_to.length > 0 && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'error.main' }}>
                        <AttackIcon sx={{ fontSize: '1em', mr: 0.5 }} />
                        Weak Against ({typeCoverage.weak_to.length} types)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {typeCoverage.weak_to.map((type) => (
                          <PokemonTypeChip key={type} type={type} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    <SuggestionIcon sx={{ mr: 1 }} />
                    Team Suggestions
                  </Typography>
                  <List>
                    {suggestions.map((suggestion, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={suggestion.reason}
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Recommended types:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                  {suggestion.suggested_types.map((type) => (
                                    <PokemonTypeChip key={type} type={type} size="small" />
                                  ))}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  Try these Pokémon:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {suggestion.pokemon_suggestions.slice(0, 4).map((pokemon) => (
                                    <Chip
                                      key={pokemon}
                                      label={pokemon.charAt(0).toUpperCase() + pokemon.slice(1).replace('-', ' ')}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < suggestions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* Tab Panel 1: Role Analysis */}
          <TabPanel value={currentTab} index={1}>
            {roleAnalysis && (
              <Stack spacing={3}>
                <Box>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        <RoleIcon sx={{ mr: 1 }} />
                        Team Role Distribution
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Balance Score: {roleAnalysis.balance_score}/100
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={roleAnalysis.balance_score}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>

                      <Box 
                        sx={{ 
                          display: 'grid',
                          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                          gap: 2
                        }}
                      >
                        <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <AttackIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                          <Typography variant="h6">{roleAnalysis.physical_attackers}</Typography>
                          <Typography variant="body2">Physical Attackers</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <SpecialIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                          <Typography variant="h6">{roleAnalysis.special_attackers}</Typography>
                          <Typography variant="body2">Special Attackers</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <DefenseIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                          <Typography variant="h6">{roleAnalysis.tanks}</Typography>
                          <Typography variant="body2">Tanks</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <SpeedIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                          <Typography variant="h6">{roleAnalysis.sweepers}</Typography>
                          <Typography variant="body2">Sweepers</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <DefenseIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                          <Typography variant="h6">{roleAnalysis.walls}</Typography>
                          <Typography variant="body2">Walls</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <SynergyIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                          <Typography variant="h6">{roleAnalysis.supports}</Typography>
                          <Typography variant="body2">Supports</Typography>
                        </Box>
                      </Box>

                      {roleAnalysis.missing_roles.length > 0 && (
                        <Alert severity="info" sx={{ mt: 3 }}>
                          <Typography variant="subtitle2">Missing Roles:</Typography>
                          <Typography variant="body2">
                            Consider adding: {roleAnalysis.missing_roles.join(', ')}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            )}
          </TabPanel>

          {/* Tab Panel 2: Stat Distribution */}
          <TabPanel value={currentTab} index={2}>
            {statDistribution && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    <StatsIcon sx={{ mr: 1 }} />
                    Team Stat Distribution
                  </Typography>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>Base Stat Totals</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">Average BST: {Math.round(statDistribution.total_bst)}</Typography>
                        <Typography variant="body2">Stat Focus: {statDistribution.stat_focus}</Typography>
                      </Box>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Stat</TableCell>
                              <TableCell align="right">Average</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>HP</TableCell>
                              <TableCell align="right">{Math.round(statDistribution.avg_hp)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Attack</TableCell>
                              <TableCell align="right">{Math.round(statDistribution.avg_attack)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Defense</TableCell>
                              <TableCell align="right">{Math.round(statDistribution.avg_defense)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Sp. Attack</TableCell>
                              <TableCell align="right">{Math.round(statDistribution.avg_special_attack)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Sp. Defense</TableCell>
                              <TableCell align="right">{Math.round(statDistribution.avg_special_defense)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Speed</TableCell>
                              <TableCell align="right">{Math.round(statDistribution.avg_speed)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>Stat Analysis</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip 
                          label={`Focus: ${statDistribution.stat_focus}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Your team's stat distribution shows a {statDistribution.stat_focus.toLowerCase()} orientation.
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* Tab Panel 3: Move Coverage */}
          <TabPanel value={currentTab} index={3}>
            {moveCoverage && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    <SynergyIcon sx={{ mr: 1 }} />
                    Move Coverage Analysis
                  </Typography>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Move Diversity: {moveCoverage.type_diversity}/18
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(moveCoverage.type_diversity / 18) * 100}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Coverage Quality: {moveCoverage.coverage_quality}
                      </Typography>
                      <Chip 
                        label={moveCoverage.coverage_quality}
                        color={
                          moveCoverage.coverage_quality === 'excellent' ? 'success' :
                          moveCoverage.coverage_quality === 'good' ? 'primary' :
                          moveCoverage.coverage_quality === 'average' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </Box>
                  </Stack>

                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Your team covers {moveCoverage.type_diversity} different move types, providing 
                    {moveCoverage.coverage_quality.toLowerCase()} offensive coverage against various opponents.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </TabPanel>

          {/* Tab Panel 4: Competitive Viability */}
          <TabPanel value={currentTab} index={4}>
            {competitiveViability && (
              <Stack spacing={3}>
                <Box>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        <InsightIcon sx={{ mr: 1 }} />
                        Competitive Analysis
                      </Typography>

                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                          <Box sx={{ textAlign: 'center', p: 3, border: 2, borderColor: 'primary.main', borderRadius: 2 }}>
                            <Typography variant="h3" color="primary.main">
                              {competitiveViability.tier_rating}
                            </Typography>
                            <Typography variant="h6">Tier Rating</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Overall Score: {competitiveViability.overall_score}/100
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={competitiveViability.overall_score}
                              sx={{ height: 10, borderRadius: 1 }}
                            />
                          </Box>

                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                            <Box>
                              <Typography variant="body2">
                                Synergy: {competitiveViability.synergy_score}/100
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={competitiveViability.synergy_score}
                              />
                            </Box>
                            <Box>
                              <Typography variant="body2">
                                Versatility: {competitiveViability.versatility}/100
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={competitiveViability.versatility}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Stack>

                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle2" color="success.main">
                                Strengths
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {competitiveViability.strengths.map((strength, index) => (
                                  <ListItem key={index}>
                                    <ListItemText primary={strength} />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle2" color="error.main">
                                Weaknesses
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {competitiveViability.weaknesses.map((weakness, index) => (
                                  <ListItem key={index}>
                                    <ListItemText primary={weakness} />
                                  </ListItem>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      </Stack>

                      <Alert severity="info" sx={{ mt: 3 }}>
                        <Typography variant="body2">
                          Meta Relevance: {competitiveViability.meta_relevance}% - 
                          This team's viability in the current competitive meta.
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            )}
          </TabPanel>
        </>
      )}
    </Paper>
  );
};

export default TeamAnalysis;
