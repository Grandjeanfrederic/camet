import React from 'react'
import { Box, Paper, TextField, Button, Grid, MenuItem, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

const travelTypes = [
  { value: 'delivery', label: 'Livraison' },
  { value: 'pickup', label: 'Enlèvement' },
  { value: 'transfer', label: 'Transfert' }
]

const travelStatuses = [
  { value: 'planned', label: 'Planifié' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
]

const TravelForm = ({ onSubmit, initialData }) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData || {
      title: '',
      type: '',
      origin: '',
      destination: '',
      date: '',
      status: 'planned'
    }
  })

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Modifier le Voyage' : 'Nouveau Voyage'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Le titre est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Titre du voyage"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Le type est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Type de voyage"
                  error={!!errors.type}
                  helperText={errors.type?.message}
                >
                  {travelTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="origin"
              control={control}
              rules={{ required: "L'origine est requise" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Origine"
                  error={!!errors.origin}
                  helperText={errors.origin?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="destination"
              control={control}
              rules={{ required: 'La destination est requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Destination"
                  error={!!errors.destination}
                  helperText={errors.destination?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="date"
              control={control}
              rules={{ required: 'La date est requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="datetime-local"
                  fullWidth
                  label="Date et heure"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
                  {travelStatuses.map((option) => (
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

export default TravelForm