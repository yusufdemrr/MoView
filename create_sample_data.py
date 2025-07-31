#!/usr/bin/env python3
"""
Script to create sample users and reviews for MoView database
Run this from the project root directory
"""

import requests
import json

API_BASE = "http://localhost:8000"

# Sample users to create
sample_users = [
    {"username": "johndoe", "email": "john@example.com", "password": "password123"},
    {"username": "janedoe", "email": "jane@example.com", "password": "password123"},
    {"username": "moviecritic", "email": "critic@movies.com", "password": "password123"},
    {"username": "filmfan", "email": "fan@films.com", "password": "password123"},
]

# Sample reviews (movie IDs from TMDB)
sample_reviews = [
    {"movie_id": 755898, "content": "War of the Worlds was an incredible thriller! Great special effects.", "rating": 4.2},
    {"movie_id": 1087192, "content": "How to Train Your Dragon is a masterpiece of animation!", "rating": 5.0},
    {"movie_id": 1311031, "content": "Demon Slayer movie was visually stunning and emotionally powerful.", "rating": 4.8},
    {"movie_id": 552524, "content": "Lilo & Stitch live-action looks promising from the trailers.", "rating": 3.5},
]

def create_user(user_data):
    """Create a user via the API"""
    try:
        response = requests.post(f"{API_BASE}/auth/register", json=user_data)
        if response.status_code == 200:
            print(f"✅ Created user: {user_data['username']}")
            return response.json()
        else:
            print(f"❌ Failed to create user {user_data['username']}: {response.json()}")
            return None
    except Exception as e:
        print(f"❌ Error creating user {user_data['username']}: {e}")
        return None

def login_user(email, password):
    """Login user and get token"""
    try:
        response = requests.post(f"{API_BASE}/auth/login", json={"email": email, "password": password})
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"❌ Failed to login {email}: {response.json()}")
            return None
    except Exception as e:
        print(f"❌ Error logging in {email}: {e}")
        return None

def create_review(token, user_id, review_data):
    """Create a review via the API"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        review_payload = {**review_data, "user_id": user_id}
        response = requests.post(f"{API_BASE}/reviews/", json=review_payload, headers=headers)
        if response.status_code == 200:
            print(f"✅ Created review for movie {review_data['movie_id']}")
            return response.json()
        else:
            print(f"❌ Failed to create review: {response.json()}")
            return None
    except Exception as e:
        print(f"❌ Error creating review: {e}")
        return None

def main():
    print("🚀 Creating sample users and reviews for MoView...")
    print("-" * 50)
    
    created_users = []
    
    # Create users
    print("👥 Creating users...")
    for user_data in sample_users:
        user = create_user(user_data)
        if user:
            created_users.append((user, user_data))
    
    print(f"\n📝 Created {len(created_users)} users. Now creating reviews...")
    
    # Create reviews for the first few users
    for i, (user, user_data) in enumerate(created_users[:3]):  # Only first 3 users
        token = login_user(user_data["email"], user_data["password"])
        if token:
            # Create 1-2 reviews per user
            reviews_to_create = sample_reviews[i:i+2]  # Different reviews per user
            for review_data in reviews_to_create:
                create_review(token, user["id"], review_data)
    
    print("\n🎉 Sample data creation complete!")
    print("\n📊 To view the data, run:")
    print("docker-compose exec db psql -U postgres -d moview_db -c \"SELECT COUNT(*) FROM users;\"")
    print("docker-compose exec db psql -U postgres -d moview_db -c \"SELECT COUNT(*) FROM reviews;\"")

if __name__ == "__main__":
    main() 