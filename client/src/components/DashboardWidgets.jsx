import React from 'react'
import { Grid, Paper, Typography, Box, List, ListItem, ListItemText, ListItemIcon } from '@mui/material'
import { Warning as WarningIcon, CheckCircle as CheckIcon, Timeline as TimelineIcon } from '@mui/icons-material'

const StatWidget = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Typography variant="h6" component="div">
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" component="div" sx={{ color }}>
      {value}
    </Typography>
  </Paper>
)

const AlertWidget = ({ alerts }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6" component="div" sx={{ mb: 2 }}>
      Alertes Récentes
    </Typography>
    <List>
      {alerts.map((alert, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            {alert.severity === 'warning' ? (
              <WarningIcon color="warning" />
            ) : (
              <CheckIcon color="success" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={alert.message}
            secondary={alert.timestamp}
          />
        </ListItem>
      ))}
    </List>
  </Paper>
)

const DashboardWidgets = ({ stats, alerts }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StatWidget
          title="Commandes en Cours"
          value={stats.activeOrders}
          icon={<TimelineIcon color="primary" />}
          color="primary.main"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <StatWidget
          title="Produits en Stock"
          value={stats.productsInStock}
          icon={<TimelineIcon color="success" />}
          color="success.main"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <StatWidget
          title="Alertes Actives"
          value={stats.activeAlerts}
          icon={<WarningIcon color="warning" />}
          color="warning.main"
        />
      </Grid>
      <Grid item xs={12}>
        <AlertWidget alerts={alerts} />
      </Grid>
    </Grid>
  )
}

export default DashboardWidgets