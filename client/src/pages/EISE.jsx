import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'

const EISE = () => {
  const [eises, setEises] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedEise, setSelectedEise] = useState(null)
  const [formData, setFormData] = useState({
    reference: '',
    designation: '',
    type: '',
    etat: 'disponible',
    dateExpiration: '',
    frequenceControle: 30,
    notes: ''
  })

  const etats = ['disponible', 'en_service', 'en_maintenance', 'perime', 'hors_service']

  useEffect(() => {
    fetchEises()
  }, [])

  const fetchEises = async () => {
    try {
      const response = await fetch('/api/eises')
      const data = await response.json()
      setEises(data)
    } catch (error) {
      console.error('Erreur lors de la récupération des EISE:', error)
    }
  }

  const handleOpenDialog = (eise = null) => {
    if (eise) {
      setFormData({
        reference: eise.reference,
        designation: eise.designation,
        type: eise.type,
        etat: eise.etat,
        dateExpiration: eise.dateExpiration.split('T')[0],
        frequenceControle: eise.frequenceControle,
        notes: eise.notes || ''
      })
      setSelectedEise(eise)
    } else {
      setFormData({
        reference: '',
        designation: '',
        type: '',
        etat: 'disponible',
        dateExpiration: '',
        frequenceControle: 30,
        notes: ''
      })
      setSelectedEise(null)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedEise(null)
    setFormData({
      reference: '',
      designation: '',
      type: '',
      etat: 'disponible',
      dateExpiration: '',
      frequenceControle: 30,
      notes: ''
    })
  }

  const handleSave = async () => {
    try {
      const url = selectedEise
        ? `/api/eises/${selectedEise.id}`
        : '/api/eises'
      const method = selectedEise ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde')

      fetchEises()
      handleCloseDialog()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) return

    try {
      const response = await fetch(`/api/eises/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      fetchEises()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const columns = [
    { field: 'reference', headerName: 'Référence', flex: 1 },
    { field: 'designation', headerName: 'Désignation', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'etat', headerName: 'État', flex: 1 },
    {
      field: 'dateExpiration',
      headerName: 'Date d\'expiration',
      flex: 1,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString()
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(params.row)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Équipements EISE</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter un EISE
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={eises}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          density="comfortable"
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEise ? 'Modifier l\'équipement EISE' : 'Ajouter un équipement EISE'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Référence"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Désignation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="État"
                value={formData.etat}
                onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
              >
                {etats.map((etat) => (
                  <MenuItem key={etat} value={etat}>
                    {etat.charAt(0).toUpperCase() + etat.slice(1).replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date d'expiration"
                value={formData.dateExpiration}
                onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Fréquence de contrôle (jours)"
                value={formData.frequenceControle}
                onChange={(e) => setFormData({ ...formData, frequenceControle: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {selectedEise ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EISE