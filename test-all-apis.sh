#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Test user credentials
EMAIL="test.user@gmail.com"
PASSWORD="Test123456!"
FULL_NAME="Test User"
PHONE_NUMBER="+1234567890"

# Variables to store IDs and token
TOKEN=""
FLIGHT_ID=""
BOOKING_ID=""

echo -e "${BLUE}=== Flight Booking System API Test ===${NC}"
echo -e "${BLUE}======================================${NC}"

# Function to check if the server is running
check_server() {
  echo -e "\n${YELLOW}Checking if server is running...${NC}"
  
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/auth/test)
  
  if [ "$RESPONSE" == "200" ]; then
    echo -e "${GREEN}Server is running!${NC}"
    return 0
  else
    echo -e "${RED}Server is not running. Please start the server with 'npm run start:dev'${NC}"
    exit 1
  fi
}

# Test Auth APIs
test_auth_apis() {
  echo -e "\n${YELLOW}Testing Authentication APIs...${NC}"
  
  # Test signup
  echo -e "\n${BLUE}1. Testing Sign Up API${NC}"
  SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\",
      \"full_name\": \"$FULL_NAME\",
      \"phone_number\": \"$PHONE_NUMBER\"
    }")
  
  echo "Response: $SIGNUP_RESPONSE"
  
  # Test signin
  echo -e "\n${BLUE}2. Testing Sign In API${NC}"
  SIGNIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signin" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  
  echo "Response: $SIGNIN_RESPONSE"
  
  # Extract token
  TOKEN=$(echo $SIGNIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get token. Using test token instead.${NC}"
    # Use a test token if signin fails (you might need to replace this with a valid token)
    TOKEN="eyJhbGciOiJIUzI1NiIsImtpZCI6IkhwZW42TktrYk1hNnc0NDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2ZzdHlkaGl3ZHp3c2pna2Jhb216LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkNjY2NDNiNC04ODFlLTQzZDAtYWVlOC0wMzIzYTYzN2RkZmEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQxMTkxMzM5LCJpYXQiOjE3NDExODc3MzksImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzQxMTg3NzM5fV0sInNlc3Npb25faWQiOiI3ODk2NTdmNy0yYjk4LTQ3ZWMtOGJmMi1hZDUzNjcwMWU4NzAiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.Zfq2XuG5HRr2GffIhI0Wt3uiPFtp0W-YDKGdtGSPz9k"
  else
    echo -e "${GREEN}Successfully got token!${NC}"
  fi
  
  # Test get profile
  echo -e "\n${BLUE}3. Testing Get Profile API${NC}"
  PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response: $PROFILE_RESPONSE"
}

# Test Flight APIs
test_flight_apis() {
  echo -e "\n${YELLOW}Testing Flight APIs...${NC}"
  
  # Test get all flights
  echo -e "\n${BLUE}1. Testing Get All Flights API${NC}"
  FLIGHTS_RESPONSE=$(curl -s -X GET "$BASE_URL/flights" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response: $FLIGHTS_RESPONSE"
  
  # Extract a flight ID
  FLIGHT_ID=$(echo $FLIGHTS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
  
  if [ -z "$FLIGHT_ID" ]; then
    echo -e "${RED}Failed to get flight ID. Make sure you have seeded the database.${NC}"
    exit 1
  else
    echo -e "${GREEN}Successfully got flight ID: $FLIGHT_ID${NC}"
  fi
  
  # Test search flights with filters
  echo -e "\n${BLUE}2. Testing Search Flights API with Filters${NC}"
  SEARCH_RESPONSE=$(curl -s -X GET "$BASE_URL/flights?origin=NYC&destination=LAX&min_price=100&max_price=500" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response: $SEARCH_RESPONSE"
  
  # Test get flight by ID
  echo -e "\n${BLUE}3. Testing Get Flight by ID API${NC}"
  FLIGHT_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/flights/$FLIGHT_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response: $FLIGHT_DETAIL_RESPONSE"
}

# Test Booking APIs
test_booking_apis() {
  echo -e "\n${YELLOW}Testing Booking APIs...${NC}"
  
  # Test create booking
  echo -e "\n${BLUE}1. Testing Create Booking API${NC}"
  CREATE_BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/bookings" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"flight_id\": \"$FLIGHT_ID\",
      \"number_of_seats\": 1,
      \"payment_method\": \"credit_card\"
    }")
  
  echo "Response: $CREATE_BOOKING_RESPONSE"
  
  # Extract booking ID
  BOOKING_ID=$(echo $CREATE_BOOKING_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
  
  if [ -z "$BOOKING_ID" ]; then
    echo -e "${RED}Failed to get booking ID.${NC}"
  else
    echo -e "${GREEN}Successfully got booking ID: $BOOKING_ID${NC}"
    
    # Test get user bookings
    echo -e "\n${BLUE}2. Testing Get User Bookings API${NC}"
    USER_BOOKINGS_RESPONSE=$(curl -s -X GET "$BASE_URL/bookings" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response: $USER_BOOKINGS_RESPONSE"
    
    # Test get booking by ID
    echo -e "\n${BLUE}3. Testing Get Booking by ID API${NC}"
    BOOKING_DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/bookings/$BOOKING_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response: $BOOKING_DETAIL_RESPONSE"
    
    # Test confirm booking
    echo -e "\n${BLUE}4. Testing Confirm Booking API${NC}"
    CONFIRM_BOOKING_RESPONSE=$(curl -s -X PUT "$BASE_URL/bookings/$BOOKING_ID/confirm" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response: $CONFIRM_BOOKING_RESPONSE"
    
    # Test cancel booking
    echo -e "\n${BLUE}5. Testing Cancel Booking API${NC}"
    CANCEL_BOOKING_RESPONSE=$(curl -s -X PUT "$BASE_URL/bookings/$BOOKING_ID/cancel" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response: $CANCEL_BOOKING_RESPONSE"
  fi
}

# Main execution
check_server
test_auth_apis
test_flight_apis
test_booking_apis

echo -e "\n${GREEN}All API tests completed!${NC}" 