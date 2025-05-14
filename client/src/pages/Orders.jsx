import React, { useState } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

const Orders = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orders] = useState([
    { id: 1, reference: 'CMD001', client: 'Client A', status: 'En cours', date: '2023-10-15', type: 'Touret' },
    { id: 2, reference: 'CMD002', client: 'Client B', status: 'Validée', date: '2023-10-16', type: 'EISE' },
    { id: 3, reference: 'CMD003', client: 'Client C', status: 'En attente', date: '2023-10-17', type: 'ESTI' }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours': return 'primary'
      case 'Validée': return 'success'
      case 'En attente': return 'warning'
      default: return 'default'
    }
  }

  const handleOpenDialog = (order = null) => {
    setSelectedOrder(order)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setSelectedOrder(null)
    setOpenDialog(false)
  }

  const handleSave = () => {
    // Logique de sauvegarde à implémenter
    handleCloseDialog()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Commandes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouvelle commande
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Référence</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.reference}</TableCell>
                <TableCell>{order.client}</TableCell>
                <TableCell>{order.type}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(order)}
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
          {selectedOrder ? 'Modifier la commande' : 'Nouvelle commande'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Référence"
            type="text"
            fullWidth
            defaultValue={selectedOrder?.reference}
          />
          <TextField
            margin="dense"
            label="Client"
            type="text"
            fullWidth
            defaultValue={selectedOrder?.client}
          />
          <TextField
            margin="dense"
            label="Type"
            select
            fullWidth
            defaultValue={selectedOrder?.type || 'Touret'}
          >
            <MenuItem value="Touret">Touret</MenuItem>
            <MenuItem value="EISE">EISE</MenuItem>
            <MenuItem value="ESTI">ESTI</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            defaultValue={selectedOrder?.date}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Statut"
            select
            fullWidth
            defaultValue={selectedOrder?.status || 'En attente'}
          >
            <MenuItem value="En attente">En attente</MenuItem>
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="Validée">Validée</MenuItem>
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

export default Orders