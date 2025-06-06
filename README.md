# Packlista Kreta 🏝️

A collaborative, real-time packing list web application for family trips to Crete, built with Firebase and vanilla JavaScript.

## Features

- **Real-time collaboration**: Changes are instantly visible to all family members
- **Shared packing list**: Pre-populated with essential items organized by categories
- **Anonymous authentication**: No account required - share the URL to collaborate
- **Mobile-friendly**: Responsive design with Tailwind CSS
- **Offline persistence**: Works with Firebase's offline capabilities

## Categories

The app comes pre-loaded with categorized packing items:

- **Viktigt (Handbagage)** - Essential documents and items for carry-on
- **Kläder** - Clothing items for various occasions
- **Bad & Strand** - Beach and swimming essentials
- **Träning** - Sports and fitness equipment (padel rackets, etc.)
- **Hygien & Apotek** - Personal hygiene and medical supplies
- **För Barnen** - Entertainment and activities for children

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Styling**: Tailwind CSS with Inter font
- **Backend**: Firebase Firestore for real-time database
- **Authentication**: Firebase Anonymous Authentication
- **Hosting**: Static HTML/CSS/JS (can be deployed anywhere)

## Setup

1. Configure Firebase credentials in the JavaScript configuration section
2. Replace `YOUR_API_KEY`, `YOUR_AUTH_DOMAIN`, and `YOUR_PROJECT_ID` with your Firebase project details
3. Deploy the static files to your preferred hosting service
4. Share the URL with family members to start collaborative packing

## Usage

- Add new items using the input form
- Check off items as they're packed (items will show strike-through)
- Delete items using the × button
- All changes sync in real-time across all connected devices

Perfect for family trips where everyone needs to coordinate packing responsibilities!
