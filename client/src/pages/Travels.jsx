import React, { useState } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, LinearProgress } from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

const Travels = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedTravel, setSelectedTravel] = useState(null)
  const [travels] = useState([
    { id: 1, reference: 'VOY001', origin: 'Paris', destination: 'Lyon', status: 'En cours', progress: 60, type: 'Touret' },
    { id: 2, reference: 'VOY002', origin: 'Marseille', destination: 'Bordeaux', status: 'Planifié', progress: 0, type: 'EISE' },
    { id: 3, reference: 'VOY003', origin: 'Lille', destination: 'Toulouse', status: 'Terminé', progress: 100, type: 'ESTI' }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours': return 'primary'
      case 'Planifié': return 'warning'
      case 'Terminé': return 'success'
      default: return 'default'
    }
  }

  const handleOpenDialog = (travel = null) => {
    setSelectedTravel(travel)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setSelectedTravel(null)
    setOpenDialog(false)
  }

  const handleSave = () => {
    // Logique de sauvegarde à implémenter
    handleCloseDialog()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Voyages</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau voyage
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Référence</TableCell>
              <TableCell>Origine</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Progression</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {travels.map((travel) => (
              <TableRow key={travel.id}>
                <TableCell>{travel.reference}</TableCell>
                <TableCell>{travel.origin}</TableCell>
                <TableCell>{travel.destination}</TableCell>
                <TableCell>{travel.type}</TableCell>
                <TableCell>
                  <Chip
                    label={travel.status}
                    color={getStatusColor(travel.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ width: '200px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress variant="determinate" value={travel.progress} />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${Math.round(travel.progress)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(travel)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTravel ? 'Modifier le voyage' : 'Nouveau voyage'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Référence"
            type="text"
            fullWidth
            defaultValue={selectedTravel?.reference}
          />
          <TextField
            margin="dense"
            label="Origine"
            type="text"
            fullWidth
            defaultValue={selectedTravel?.origin}
          />
          <TextField
            margin="dense"
            label="Destination"
            type="text"
            fullWidth
            defaultValue={selectedTravel?.destination}
          />
          <TextField
            margin="dense"
            label="Type"
            select
            fullWidth
            defaultValue={selectedTravel?.type || 'Touret'}
          >
            <MenuItem value="Touret">Touret</MenuItem>
            <MenuItem value="EISE">EISE</MenuItem>
            <MenuItem value="ESTI">ESTI</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Statut"
            select
            fullWidth
            defaultValue={selectedTravel?.status || 'Planifié'}
          >
            <MenuItem value="Planifié">Planifié</MenuItem>
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="Terminé">Terminé</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Progression"
            type="number"
            fullWidth
            defaultValue={selectedTravel?.progress || 0}
            InputProps={{ inputProps: { min: 0, max: 100 } }}
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

export default Travels