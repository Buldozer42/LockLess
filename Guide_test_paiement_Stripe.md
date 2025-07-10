# Guide de test pour les paiements Stripe

## Cartes de test Stripe

Nous sommes en test et n'utilison pas de webhook, vous pouvez utiliser les cartes de test suivantes sur la page de paiement Stripe :

### Paiement réussi
- **Numéro**: 4242 4242 4242 4242
- **Date**: N'importe quelle date future
- **CVC**: N'importe quel code à 3 chiffres
- **Code postal**: N'importe quel code postal valide

### Paiement refusé
- **Numéro**: 4000 0000 0000 0002
- **Date**: N'importe quelle date future
- **CVC**: N'importe quel code à 3 chiffres
- **Code postal**: N'importe quel code postal valide

### Authentification 3D Secure requise
- **Numéro**: 4000 0000 0000 3220 
- **Date**: N'importe quelle date future
- **CVC**: N'importe quel code à 3 chiffres
- **Code postal**: N'importe quel code postal valide

## Flux de test

1. Créez une réservation en utilisant l'API `/booking`
2. Récupérez l'ID de réservation
3. Appelez `/payment/create-session/:bookingId` pour créer une session de paiement
4. Redirigez l'utilisateur vers l'URL retournée (`session.url`)
5. Utilisez une carte de test pour simuler le paiement
6. Une fois le paiement effectué, l'utilisateur sera redirigé vers `/payment/success?id=bookingId`
7. Cette route vérifie automatiquement le statut du paiement et met à jour la réservation si nécessaire
8. Pour vérifier manuellement le statut plus tard, utilisez `/payment/verify/:bookingId`