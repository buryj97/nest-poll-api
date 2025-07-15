# Sondages Express (NestJS, Prisma, Swagger, Maildev)

## Présentation
Sondages Express est une API backend (NestJS + Prisma) pour gérer des sondages avec inscription, confirmation d'email, 2FA, rôles (admin/utilisateur), votes uniques, et documentation Swagger. Tout se teste via Swagger, aucun frontend n'est fourni.

## Lancement rapide
1. **Installer les dépendances Node.js**
```bash
npm install
```

2. **Démarrer la base de données et Maildev**
```bash
docker compose up -d
```
- Maildev (emails) : http://localhost:1080

3. **Générer Prisma et migrer la base**
```bash
npx prisma generate
npx prisma migrate deploy
```

4. **Démarrer l'API NestJS**
```bash
npm run start:dev
```

## Utilisation
- Documentation interactive : http://localhost:3000/api
- Les emails de confirmation et 2FA sont visibles dans Maildev (http://localhost:1080)

## Notes
- Seuls les admins peuvent créer des sondages et voir tous les utilisateurs.
- Un utilisateur ne peut voter qu'une fois par sondage.
- Authentification JWT et 2FA par email.

---
