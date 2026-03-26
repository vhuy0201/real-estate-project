import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  Chip,
  InputAdornment
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getPublicAgents } from '../../services/publicAgent.service';
import { getAllPropertiesPublic, getAllCities } from '../../services/propertyService';
import type { Agent } from '../../types/Agent';
import type { Property } from '../../types/Property';
import type { City } from '../../types/City';
import useTitle from '@/hooks/useTitle';
import { getLanguage } from '@/utils/storage';

interface AgentWithLocation extends Agent {
  cities: Set<string>;
  propertyCount: number;
}

const AgentListPage = () => {
  const { t } = useTranslation('agentList');
  const navigate = useNavigate();
  const lang = getLanguage() as 'vi' | 'en';

  const [agents, setAgents] = useState<AgentWithLocation[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchMode, setSearchMode] = useState<"location" | "name">("location");

  useTitle(t('pageTitle'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [agentsData, propertiesData, citiesData] = await Promise.all([
          getPublicAgents(),
          getAllPropertiesPublic(),
          getAllCities()
        ]);

        const agentLocationMap = new Map<string, { cities: Set<string>, count: number }>();

        propertiesData.forEach((property: Property) => {
          if (property.agent_id && typeof property.agent_id === 'object' && '_id' in property.agent_id) {
            const agentId = property.agent_id._id;
            if (!agentLocationMap.has(agentId)) {
              agentLocationMap.set(agentId, { cities: new Set(), count: 0 });
            }
            const agentData = agentLocationMap.get(agentId)!;

            if (property.city_id && typeof property.city_id === 'object' && '_id' in property.city_id) {
              agentData.cities.add(property.city_id._id);
            }
            agentData.count++;
          }
        });

        const agentsWithLocation: AgentWithLocation[] = agentsData.map((agent: Agent) => ({
          ...agent,
          cities: agentLocationMap.get(agent._id)?.cities || new Set(),
          propertyCount: agentLocationMap.get(agent._id)?.count || 0
        }));

        setAgents(agentsWithLocation);
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch = searchTerm === '' ||
        agent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity = selectedCity === 'all' || agent.cities.has(selectedCity);

      return matchesSearch && matchesCity;
    });
  }, [agents, searchTerm, selectedCity]);

  const handleAgentClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#052647"
            sx={{
              mb: 1.5,
              fontSize: { xs: '1.5rem', md: '2rem' },
              lineHeight: 1.3
            }}
          >
            {t('title')}
          </Typography>
          <Typography
            variant="body1"
            color="#2a445e"
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem' },
              lineHeight: 1.5,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            {t('subtitle')}
          </Typography>

        </Box>

        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: { xs: "flex-start", md: "space-between" },
            gap: { xs: 1.5, md: 2 },
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: { xs: "0 2px 6px rgba(15,23,42,0.06)", md: "0 6px 16px rgba(15,23,42,0.08)" },
            border: "1px solid #e5e7eb",
            p: { xs: 1.5, md: 1.5 }
          }}
        >
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 1.5, md: 0 }
            }}
          >
            <Box
              sx={{
                display: "flex",
                borderRight: { xs: "none", md: "1px solid #e0e0e0" },
                borderBottom: { xs: "1px solid #e0e0e0", md: "none" }
              }}
            >
              <Box
                onClick={() => {
                  setSearchMode("location");
                  setSearchTerm("");
                  setSelectedCity("all");
                }}
                sx={{
                   flex: 1,
                   textAlign: "center",
                   px: { xs: 1.5, md: 3 },
                  py: 1.2,
                  cursor: "pointer",
                  fontWeight: searchMode === "location" ? "bold" : 500,
                  bgcolor: searchMode === "location" ? "#f0f6ff" : "white",
                  borderBottom: searchMode === "location"
                    ? "3px solid #1976d2"
                    : "3px solid transparent",
                  color: searchMode === "location" ? "#000" : "#555",
                  transition: "0.2s"
                }}
              >
                Location
              </Box>
              <Box
                onClick={() => {
                  setSearchMode("name");
                  setSelectedCity("all");
                  setSearchTerm("");
                }}
                sx={{
                   flex: 1,
                   textAlign: "center",
                   px: { xs: 1.5, md: 3 },
                  py: 1.2,
                  cursor: "pointer",
                  fontWeight: searchMode === "name" ? "bold" : 500,
                  bgcolor: searchMode === "name" ? "#f0f6ff" : "white",
                  borderBottom: searchMode === "name"
                    ? "3px solid #1976d2"
                    : "3px solid transparent",
                  color: searchMode === "name" ? "#000" : "#555",
                  transition: "0.2s"
                }}
              >
                Name
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              {searchMode === "location" ? (
                <TextField
                  select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: "#6b7280" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& fieldset": { border: "none" },
                    bgcolor: "white",
                  }}
                >
                  <MenuItem value="all">{t("allLocations")}</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city._id} value={city._id}>
                      {city.city_name[lang]}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#6b7280" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& fieldset": { border: "none" },
                    bgcolor: "white",
                  }}
                />
              )}
            </Box>
          </Box>

          <Button
            variant="outlined"
            onClick={() => {
              setSearchTerm("");
              setSelectedCity("all");
              setSearchMode("location");
            }}
            sx={{
              whiteSpace: "nowrap",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: { xs: 2, md: 2.5 },
              py: 1,
              width: { xs: "100%", md: "auto" },
              alignSelf: { xs: "stretch", md: "auto" }
            }}
          >
            {t("clearFilters")}
          </Button>
        </Box>


        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {t('found')} <strong>{filteredAgents.length}</strong> {t('agents')}
        </Typography>

        {filteredAgents.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noAgentsFound')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('noResultsDescription')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAgents.map((agent) => (
            <Grid size={{ xs: 12, md: 6 }} key={agent._id}>
                <Card
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    transition: '0.3s ease',
                    cursor: 'pointer',
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => handleAgentClick(agent._id)}
                >
                  {agent.propertyCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: '#1976d2',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}
                    >
                      {agent.propertyCount} {t('properties')}
                    </Box>
                  )}

                  <Box
                    sx={{
                      width: { xs: 96, sm: 130 },
                      height: { xs: 96, sm: 130 },
                      borderRadius: '50%',
                      overflow: 'hidden',
                      mr: { xs: 0, sm: 3 },
                      mb: { xs: 2, sm: 0 },
                      flexShrink: 0,
                      alignSelf: { xs: 'center', sm: 'flex-start' }
                    }}
                  >
                    <Avatar
                      src={agent.avatar || '/defaultUser.png'}
                      alt={agent.fullName}
                      sx={{ width: '100%', height: '100%' }}
                    />
                  </Box>

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                      {agent.fullName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <EmailIcon fontSize="small" sx={{ color: '#1976d2' }} />
                      <Typography variant="body2" color="text.secondary">
                        {agent.email}
                      </Typography>
                    </Box>

                    {agent.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PhoneIcon fontSize="small" sx={{ color: '#2e7d32' }} />
                        <Typography variant="body2" color="text.secondary">
                          {agent.phone}
                        </Typography>
                      </Box>
                    )}

                    {agent.cities.size > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: '#ed6c02', mt: '3px' }} />

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            {t('activeAreas')}:
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {Array.from(agent.cities).slice(0, 3).map(cityId => {
                              const city = cities.find(c => c._id === cityId);
                              return city ? (
                                <Chip
                                  key={cityId}
                                  label={city.city_name[lang]}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.75rem',
                                    borderRadius: 1,
                                  }}
                                />
                              ) : null;
                            })}

                            {agent.cities.size > 3 && (
                              <Chip label={`+${agent.cities.size - 3}`} size="small" variant="outlined" />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AgentListPage;

