import React, { useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

const Locations = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locations] = useState([
    { id: 1, name: 'Zone A-1', type: 'Stockage', status: 'Disponible', capacity: 50, occupied: 30 },
    { id: 2, name: 'Zone B-2', type: 'Transit', status: 'Occupé', capacity: 30, occupied: 30 },
    { id: 3, name: 'Zone C-3', type: 'Maintenance', status: 'En maintenance', capacity: 20, occupied: 5 }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponible': return 'success'
      case 'Occupé': return 'error'
      case 'En maintenance': return 'warning'
      default: return 'default'
    }
  }

  const getOccupationPercentage = (location) => {
    return Math.round((location.occupied / location.capacity) * 100)
  }

  const handleOpenDialog = (location = null) => {
    setSelectedLocation(location)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setSelectedLocation(null)
    setOpenDialog(false)
  }

  const handleSave = () => {
    // Logique de sauvegarde à implémenter
    handleCloseDialog()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Emplacements</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter un emplacement
        </Button>
      </Box>

      <Grid container spacing={3}>
        {locations.map((location) => (
          <Grid item xs={12} sm={6} md={4} key={location.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {location.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Type: {location.type}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography color="textSecondary">
                    Statut:
                  </Typography>
                  <Chip
                    label={location.status}
                    color={getStatusColor(location.status)}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary">
                  Occupation: {location.occupied}/{location.capacity} ({getOccupationPercentage(location)}%)
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(location)}
                >
                  Modifier
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                >
                  Supprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedLocation ? 'Modifier l\'emplacement' : 'Ajouter un emplacement'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'emplacement"
            type="text"
            fullWidth
            defaultValue={selectedLocation?.name}
          />
          <TextField
            margin="dense"
            label="Type"
            type="text"
            fullWidth
            defaultValue={selectedLocation?.type}
          />
          <TextField
            margin="dense"
            label="Statut"
            type="text"
            fullWidth
            defaultValue={selectedLocation?.status}
          />
          <TextField
            margin="dense"
            label="Capacité"
            type="number"
            fullWidth
            defaultValue={selectedLocation?.capacity}
          />
          <TextField
            margin="dense"
            label="Occupation"
            type="number"
            fullWidth
            defaultValue={selectedLocation?.occupied}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Locations