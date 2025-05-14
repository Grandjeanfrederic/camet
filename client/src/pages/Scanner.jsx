import React, { useState } from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'
import QrReader from 'react-qr-scanner'

const Scanner = () => {
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)

  const handleError = (err) => {
    console.error(err)
  }

  const handleScan = (data) => {
    if (data) {
      setResult(data)
      setScanning(false)
    }
  }

  const startScanning = () => {
    setResult(null)
    setScanning(true)
  }

  const stopScanning = () => {
    setScanning(false)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Scanner QR
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        {scanning ? (
          <Box>
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%', maxWidth: '500px' }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={stopScanning}
              sx={{ mt: 2 }}
            >
              Arrêter le scan
            </Button>
          </Box>
        ) : (
          <Box>
            <Button
              variant="contained"
              onClick={startScanning}
              sx={{ mb: 2 }}
            >
              Démarrer le scan
            </Button>

            {result && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Résultat du scan :
                </Typography>
                <Typography>
                  {result.text}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Placez le code QR devant la caméra pour le scanner.
      </Typography>
    </Box>
  )
}

export default Scanner