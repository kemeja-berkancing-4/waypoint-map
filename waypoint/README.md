# WAYPOINT

Spatial community mapping tool for dynamic location logging, disaster reporting, and visibility-controlled markers.

![WAYPOINT Interface](public/preview.png)

## Overview

Commercial mapping APIs prioritize static commercial points of interest. WAYPOINT addresses two specific gaps:
1. **Time-sensitive incident mapping:** Logging short-lived events (floods, blockades, temporary shelters) with peer validation instead of delayed platform updates.
2. **Access-controlled markers:** Allowing users to keep private operational points or publish community-visible markers on a single interface.

The application runs entirely on open-source GIS components, requiring no commercial map API keys or paid tile subscriptions.

---

## Technical Specifications

* **Mapping Engine:** Leaflet.js v1.9.4
* **Tile Server:** CARTO Dark Matter (via OpenStreetMap data)
* **UI & Layout:** Tailwind CSS v3 (CDN / Utility-first)
* **State Management:** Browser LocalStorage API (Client-side persistence model)
* **Deployment Target:** Vercel Static Network

---

## Core Features

* **Visibility Modes:** Toggle markers between `Public` (visible across client instances) and `Private` (restricted to the local session user).
* **Incident Verification System:** Real-time event markers include a confidence voting mechanism (`Active` / `Resolved`) to mitigate stale disaster data.
* **Filter System:** Independent layer toggles for infrastructure, community spots, and disaster alerts.
* **Zero-Dependency Core:** Pure vanilla ES6 JavaScript base without bundler overhead for fast cold-load times on low-bandwidth connections.

---