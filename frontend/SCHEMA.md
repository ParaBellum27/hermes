# Database Schema

## Tables

### creator_profiles

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| creator_id | bigint | NO | - | PRIMARY KEY |
| profile_url | text | NO | - | |
| platform | text | NO | - | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

---

### creator_content

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| content_id | bigint | NO | - | PRIMARY KEY |
| creator_id | bigint | NO | - | FK → creator_profiles(creator_id) |
| post_url | text | NO | - | |
| post_raw | text | YES | - | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

---

### user_profiles

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| user_id | uuid | NO | - | PRIMARY KEY |
| subscription_tier | text | NO | - | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

---

### user_follows

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| user_id | uuid | NO | - | FK → user_profiles(user_id), UNIQUE(user_id, creator_id) |
| creator_id | bigint | NO | - | FK → creator_profiles(creator_id), UNIQUE(user_id, creator_id) |
| created_at | timestamptz | NO | now() | |

---

### user_posts

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| post_id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| user_id | uuid | NO | - | FK → user_profiles(user_id) |
| title | text | YES | - | Post title (indexed) |
| raw_text | text | YES | - | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

---

### post_inspirations

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | bigint | NO | - | PRIMARY KEY |
| post_id | uuid | NO | - | FK → user_posts(post_id), UNIQUE(post_id, content_id) |
| content_id | bigint | NO | - | FK → creator_content(content_id), UNIQUE(post_id, content_id) |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

---

### user_media

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| user_media_id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| post_id | uuid | NO | - | FK → user_posts(post_id) |
| media_url | text | NO | - | |
| media_type | text | YES | - | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

---

## Relationships

```
user_profiles
├─→ user_follows (user_id)
└─→ user_posts (user_id)

creator_profiles
├─→ creator_content (creator_id)
└─→ user_follows (creator_id)

user_posts
├─→ post_inspirations (post_id)
└─→ user_media (post_id)

creator_content
└─→ post_inspirations (content_id)
```
