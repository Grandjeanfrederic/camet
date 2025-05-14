#!/bin/bash

# Script de déploiement pour l'environnement de production CAMET

set -e

# Vérification des prérequis
command -v docker >/dev/null 2>&1 || { echo "Docker est requis mais n'est pas installé."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose est requis mais n'est pas installé."; exit 1; }

# Création du répertoire de backup s'il n'existe pas
mkdir -p backup

# Sauvegarde de la base de données existante si elle existe
if [ "$(docker ps -q -f name=camet_db)" ]; then
    echo "Sauvegarde de la base de données..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker exec camet_db mysqldump -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "backup/backup_${timestamp}.sql"
fi

# Arrêt des conteneurs existants
echo "Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down

# Construction et démarrage des nouveaux conteneurs
echo "Construction et démarrage des conteneurs..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Vérification de la santé des services
echo "Vérification de la santé des services..."
sleep 30

# Vérification du service app
if ! curl -f http://localhost:3000/api/v1/health >/dev/null 2>&1; then
    echo "Le service app n'est pas en bonne santé"
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
fi

# Vérification de Redis
if ! docker exec camet_redis redis-cli ping >/dev/null 2>&1; then
    echo "Le service Redis n'est pas en bonne santé"
    docker-compose -f docker-compose.prod.yml logs redis
    exit 1
fi

echo "Déploiement terminé avec succès !"
echo "L'application est accessible sur https://camet.sncf.fr"