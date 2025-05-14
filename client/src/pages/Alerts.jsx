import React, { useState } from 'react'
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material'
import { Notifications as NotificationsIcon, Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'

const Alerts = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [alerts] = useState([
    { id: 1, title: 'Emplacement presque plein', message: 'Zone A-1 est occupée à 90%', severity: 'warning', timestamp: '2023-10-15 10:30', status: 'active' },
    { id: 2, title: 'Retard de livraison', message: 'Commande CMD001 en retard de 2 jours', severity: 'error', timestamp: '2023-10-15 09:15', status: 'active' },
    { id: 3, title: 'Maintenance planifiée', message: 'Maintenance prévue pour ESTI S1', severity: 'info', timestamp: '2023-10-14 16:45', status: 'resolved' }
  ])

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <ErrorIcon color="error" />
      case 'warning': return <WarningIcon color="warning" />
      case 'info': return <InfoIcon color="info" />
      default: return <NotificationsIcon />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'info': return 'info'
      default: return 'default'
    }
  }

  const handleOpenDialog = (alert = null) => {
    setSelectedAlert(alert)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setSelectedAlert(null)
    setOpenDialog(false)
  }

  const handleSave = () => {
    // Logique de sauvegarde à implémenter
    handleCloseDialog()
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Alertes
      </Typography>

      <List>
        {alerts.map((alert) => (
          <ListItem
            key={alert.id}
            sx={{
              mb: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1
            }}
            secondaryAction={
              <Box>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleOpenDialog(alert)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemIcon>
              {getSeverityIcon(alert.severity)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    {alert.title}
                  </Typography>
                  <Chip
                    label={alert.severity.toUpperCase()}
                    color={getSeverityColor(alert.severity)}
                    size="small"
                  />
                  <Chip
                    label={alert.status}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {alert.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alert.timestamp}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAlert ? 'Modifier l\'alerte' : 'Nouvelle alerte'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Titre"
            type="text"
            fullWidth
            defaultValue={selectedAlert?.title}
          />
          <TextField
            margin="dense"
            label="Message"
            type="text"
            multiline
            rows={4}
            fullWidth
            defaultValue={selectedAlert?.message}
          />
          <TextField
            margin="dense"
            label="Sévérité"
            select
            fullWidth
            defaultValue={selectedAlert?.severity || 'info'}
          >
            <MenuItem value="info">Information</MenuItem>
            <MenuItem value="warning">Avertissement</MenuItem>
            <MenuItem value="error">Erreur</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Statut"
            select
            fullWidth
            defaultValue={selectedAlert?.status || 'active'}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="resolved">Résolue</MenuItem>
          </TextField>
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

export default Alerts