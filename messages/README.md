# Diretório de Mensagens

Este diretório contém as mensagens trocadas entre passageiros e motoristas através do GitHub Actions.

## Estrutura

- `all_messages.json`: Arquivo consolidado com todas as mensagens
- `message_*.json`: Arquivos individuais de cada mensagem (timestamp)

## Como funciona

1. Quando uma mensagem é enviada através da API `/api/rides/{ride_id}/messages`
2. O backend dispara um evento `repository_dispatch` para o GitHub Actions
3. O GitHub Actions processa a mensagem e salva neste diretório
4. Os arquivos são commitados automaticamente no repositório
5. O frontend pode consultar estes arquivos para exibir as mensagens

## Formato das Mensagens

```json
{
  "id": 1,
  "ride_id": 1,
  "sender_id": 1,
  "receiver_id": 2,
  "content": "Olá, estou a caminho!",
  "created_at": "2025-01-01T12:00:00",
  "sender": {
    "id": 1,
    "username": "motorista1",
    "user_type": "driver"
  },
  "receiver": {
    "id": 2,
    "username": "passageiro1", 
    "user_type": "passenger"
  }
}
```

