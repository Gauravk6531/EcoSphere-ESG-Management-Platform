# EcoSphere API Notes

Base URL: `/api`

## Social

- `GET /social/dashboard`
- `GET /social/activities`
- `POST /social/activities`
- `GET /social/participations`
- `POST /social/participations`
- `POST /social/participations/:id/decision`
- `GET /social/diversity-metrics`
- `GET /social/training-completions`
- `POST /social/training-completions`

## Gamification

- `GET /gamification/challenges`
- `POST /gamification/challenges`
- `PUT /gamification/challenges/:id/status`
- `GET /gamification/challenge-participations`
- `POST /gamification/challenge-participations`
- `POST /gamification/challenge-participations/:id/decision`
- `GET /gamification/badges`
- `POST /gamification/badges`
- `GET /gamification/rewards`
- `POST /gamification/rewards`
- `POST /gamification/rewards/redeem`
- `GET /gamification/leaderboard`

## Reports

`GET /reports/custom?module=social&export=csv`

Supported modules:

- `environmental`
- `social`
- `social_training`
- `social_challenges`
- `governance`
- `esg_summary`

Supported export formats:

- JSON response when `export` is omitted
- `csv`
- `xlsx`
- `pdf`
