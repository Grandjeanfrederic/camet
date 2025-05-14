git@github.com:Grandjeanfrederic/CAMET.gitimport React from 'react'
import { Box, Paper, TextField, Button, Grid, MenuItem, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

const categories = [
  { value: 'touret', label: 'Touret' },
  { value: 'cable', label: 'Câble' },
  { value: 'equipment', label: 'Équipement' }
]

const statuses = [
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Réservé' },
  { value: 'maintenance', label: 'En maintenance' }
]

const ProductForm = ({ onSubmit, initialData }) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData || {
      name: '',
      category: '',
      stock: '',
      status: 'available'
    }
  })

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Modifier le Produit' : 'Nouveau Produit'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Le nom est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nom du produit"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'La catégorie est requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Catégorie"
                  error={!!errors.category}
                  helperText={errors.category?.message}
                >
                  {categories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="stock"
              control={control}
              rules={{
                required: 'La quantité est requise',
                min: { value: 0, message: 'La quantité doit être positive' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Quantité en stock"
                  error={!!errors.stock}
                  helperText={errors.stock?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Le statut est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Statut"
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  {statuses.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                {initialData ? 'Mettre à jour' : 'Créer'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default ProductForm