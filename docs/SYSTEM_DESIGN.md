# ToxicGuard System Design

## 1. High-level flow

```text
User / Researcher / Admin
          |
          v
   React + Vite UI
          |
       JWT/API
          |
          v
  Node.js + Express
    |            |
    |            +--> MongoDB (users, predictions, audit)
    |
    +-----------------> Python FastAPI ML service
                              |
                              +--> clean_text()
                              +--> tokenizer.pkl
                              +--> toxic_comment_model.h5
                              +--> six sigmoid scores
```

## 2. ML inference contract

1. Receive raw comment.
2. Lowercase.
3. Remove URLs.
4. Remove bracketed text.
5. Keep `a-z`, digits, whitespace and `!?.,'`.
6. Collapse whitespace.
7. Tokenizer converts words to integer IDs.
8. Post-pad/truncate to 200.
9. Keras model returns six sigmoid probabilities.
10. Apply user-selected threshold to identify active labels.
11. Derive a UI risk band from the highest probability.

## 3. Security

- Passwords are bcrypt-hashed.
- JWT is required for protected endpoints.
- Roles are enforced by Node middleware.
- The browser cannot call the ML model directly.
- Prediction history is associated with the authenticated user.
- Admin changes are recorded in an audit collection.
- Rate limiting is enabled on the Node API.

## 4. MongoDB collections

### users
`name`, `email`, `passwordHash`, `role`, `active`, `lastLogin`, timestamps.

### predictions
`user`, `text`, `threshold`, `probabilities`, `labels`, `isToxic`, `riskLevel`, `maxScore`, `source`, timestamps.

### auditlogs
`actor`, `action`, `target`, `meta`, timestamps.

## 5. Role matrix

| Capability | User | Researcher | Admin |
|---|---:|---:|---:|
| Single prediction | ✓ | ✓ | ✓ |
| Own history | ✓ | ✓ | ✓ |
| Batch prediction | — | ✓ | ✓ |
| Research statistics | — | ✓ | ✓ |
| User management | — | — | ✓ |
| Audit logs | — | — | ✓ |
| Platform dashboard | — | — | ✓ |
