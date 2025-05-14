import React, { useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

const Products = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products] = useState([
    { id: 1, name: 'Touret T1', type: 'Touret', status: 'Disponible' },
    { id: 2, name: 'EISE E1', type: 'EISE', status: 'En service' },
    { id: 3, name: 'ESTI S1', type: 'ESTI', status: 'En maintenance' }
  ])

  const handleOpenDialog = (product = null) => {
    setSelectedProduct(product)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setSelectedProduct(null)
    setOpenDialog(false)
  }

  const handleSave = () => {
    // Logique de sauvegarde à implémenter
    handleCloseDialog()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Produits</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter un produit
        </Button>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography color="textSecondary">
                  Type: {product.type}
                </Typography>
                <Typography color="textSecondary">
                  Statut: {product.status}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(product)}
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
          {selectedProduct ? 'Modifier le produit' : 'Ajouter un produit'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du produit"
            type="text"
            fullWidth
            defaultValue={selectedProduct?.name}
          />
          <TextField
            margin="dense"
            label="Type"
            type="text"
            fullWidth
            defaultValue={selectedProduct?.type}
          />
          <TextField
            margin="dense"
            label="Statut"
            type="text"
            fullWidth
            defaultValue={selectedProduct?.status}
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

export default Products