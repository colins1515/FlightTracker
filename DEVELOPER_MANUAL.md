# Developer Manual

## Installation

1. Clone the repository:<br>
   '''bash<br>
   git clone <repoURL>
   cd Final

2. Install dependencies:<br>
   npm install

3. Create a .env.local file with the project root:
   AVIATIONSTACK_API_KEY=736a054ad19006faec71afbca06c2399
   SUPABASE_URL=https://wsuqlpqrhigtbmitbjco.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzdXFscHFyaGlndGJtaXRiamNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjM1MDMsImV4cCI6MjA4MTczOTUwM30.SbjLKNAQeVVX5agQKsMC7XTtwWahP7OkJQljFz79bkA

## Running Application

Start development server:
   npm run dev

Application runs at:
   http://localhost:3000

## Testing

No automated tests are included in the application

## Server API

- GET /api/flights
  Retrieves flight data from the AviationStack API
  params:
    - airport: IATA airport code
    - flight_iata: Flight IATA code

- GET /api/favorites
  Returns all saved favorited flights from Supabase

- POST /api/favorites
  Saves a flight to the favorites database

## Known Issues

- Mapping features are limited by AviationStack's free tier
- Airport coordinates are stored locally, and to a limited number of large airports
- Duplicate entries into the favorites databse are not diallowed

## Future Development

- Add user auth
- Add automated testing
   
