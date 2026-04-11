
// Simplified GeoJSON structure for Bangladesh Divisions/Major Districts
// In a production environment, this should be fetched from a static asset URL or CDN
// due to the large file size of high-resolution borders.
// We are using simplified polygons for major areas to demonstrate functionality.

export const bangladeshGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Dhaka" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[90.1, 24.5], [90.8, 24.5], [90.8, 23.5], [90.1, 23.5], [90.1, 24.5]]] 
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Chittagong" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[91.5, 23.5], [92.5, 23.5], [92.5, 21.0], [91.5, 21.0], [91.5, 23.5]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Sylhet" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[91.0, 25.2], [92.5, 25.2], [92.5, 24.0], [91.0, 24.0], [91.0, 25.2]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Rajshahi" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[88.0, 25.2], [89.5, 25.2], [89.5, 24.0], [88.0, 24.0], [88.0, 25.2]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Khulna" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[89.0, 23.5], [90.0, 23.5], [90.0, 21.5], [89.0, 21.5], [89.0, 23.5]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Barisal" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[90.0, 23.0], [91.0, 23.0], [91.0, 22.0], [90.0, 22.0], [90.0, 23.0]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Rangpur" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[88.5, 26.6], [90.0, 26.6], [90.0, 25.2], [88.5, 25.2], [88.5, 26.6]]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Mymensingh" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[90.0, 25.2], [91.0, 25.2], [91.0, 24.5], [90.0, 24.5], [90.0, 25.2]]]
      }
    }
  ]
};

// NOTE: This is a placeholder structure. 
// For production, the component will attempt to fetch a full resolution
// GeoJSON file from a CDN if available, or fall back to this.
