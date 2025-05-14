#!/bin/bash

# Script de sauvegarde automatique pour CAMET

set -e

# Récupération des variables d'environnement
BACKUP_PATH=${BACKUP_PATH:-/backup}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Création du répertoire de sauvegarde s'il n'existe pas
mkdir -p "${BACKUP_PATH}"

# Génération du nom de fichier avec timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_PATH}/backup_${TIMESTAMP}.sql.gz"

# Création de la sauvegarde compressée
echo "Création de la sauvegarde ${BACKUP_FILE}..."
mysqldump -h db -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Suppression des anciennes sauvegardes
echo "Nettoyage des anciennes sauvegardes..."
find "${BACKUP_PATH}" -name "backup_*.sql.gz" -type f -mtime +${BACKUP_RETENTION_DAYS} -delete

echo "Sauvegarde terminée avec succès !"