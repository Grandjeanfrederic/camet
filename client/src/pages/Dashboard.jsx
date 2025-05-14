import React from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  // Données fictives pour les graphiques
  const commandesData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Commandes',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const emplacementsData = {
    labels: ['Disponibles', 'Occupés', 'En maintenance'],
    datasets: [
      {
        data: [300, 450, 100],
        backgroundColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 159, 64)',
          'rgb(255, 99, 132)'
        ]
      }
    ]
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des commandes
            </Typography>
            <Line data={commandesData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              État des emplacements
            </Typography>
            <Bar data={emplacementsData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard