import mapboxgl from 'mapbox-gl';
import { LocationData } from './LocationService';

export interface POI {
  id: string;
  name: string;
  category: 'hospital' | 'police' | 'fire_station' | 'pharmacy' | 'restaurant' | 'hotel' | 'attraction' | 'transport';
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  metadata?: any;
}

export interface NavigationRoute {
  id: string;
  coordinates: number[][];
  distance: number; // in meters
  duration: number; // in seconds
  steps: NavigationStep[];
  geometry: string;
}

export interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    bearing_after?: number;
    bearing_before?: number;
    location: number[];
  };
}

export interface OfflineMapTile {
  z: number;
  x: number;
  y: number;
  data: ArrayBuffer;
  style: string;
}

class AdvancedMapService {
  private map: mapboxgl.Map | null = null;
  private currentRoute: NavigationRoute | null = null;
  private routeSource: string = 'route';
  private routeLayer: string = 'route-line';
  private poiMarkers: mapboxgl.Marker[] = [];
  private offlineTiles: Map<string, OfflineMapTile> = new Map();
  private isOfflineMode: boolean = false;

  initializeMap(container: HTMLElement, options?: {
    center?: [number, number];
    zoom?: number;
    style?: string;
  }): mapboxgl.Map {
    this.map = new mapboxgl.Map({
      container,
      style: options?.style || 'mapbox://styles/mapbox/streets-v12',
      center: options?.center || [77.2090, 28.6139], // Default to Delhi
      zoom: options?.zoom || 12,
      attributionControl: false
    });

    // Add attribution control
    this.map.addControl(new mapboxgl.AttributionControl(), 'bottom-right');

    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true
    }), 'top-right');

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    this.map.addControl(geolocate, 'top-right');

    // Add scale control
    this.map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Set up offline tile interception
    this.setupOfflineTileInterception();

    return this.map;
  }

  private setupOfflineTileInterception(): void {
    if (!this.map) return;

    // Override tile loading for offline support
    this.map.on('sourcedata', (e) => {
      if (this.isOfflineMode && e.sourceId && e.tile) {
        // Implement offline tile loading logic here
        this.loadOfflineTile(e);
      }
    });
  }

  private loadOfflineTile(event: any): void {
    // Implementation for loading offline tiles
    const tileKey = `${event.tile.tileID.z}-${event.tile.tileID.x}-${event.tile.tileID.y}`;
    const offlineTile = this.offlineTiles.get(tileKey);
    
    if (offlineTile) {
      // Load tile from offline storage
      console.log('Loading offline tile:', tileKey);
    }
  }

  async calculateRoute(start: LocationData, end: LocationData, profile: 'driving' | 'walking' | 'cycling' = 'driving'): Promise<NavigationRoute | null> {
    try {
      if (!mapboxgl.accessToken) {
        throw new Error('Mapbox access token not set');
      }

      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      
      const navigationRoute: NavigationRoute = {
        id: `route-${Date.now()}`,
        coordinates: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
        steps: route.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver
        })),
        geometry: JSON.stringify(route.geometry)
      };

      this.currentRoute = navigationRoute;
      return navigationRoute;
    } catch (error) {
      console.error('Failed to calculate route:', error);
      return null;
    }
  }

  displayRoute(route: NavigationRoute): void {
    if (!this.map) return;

    // Remove existing route
    this.clearRoute();

    // Add route source
    this.map.addSource(this.routeSource, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: JSON.parse(route.geometry)
      }
    });

    // Add route layer
    this.map.addLayer({
      id: this.routeLayer,
      type: 'line',
      source: this.routeSource,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#1976d2',
        'line-width': 6,
        'line-opacity': 0.8
      }
    });

    // Fit map to route bounds
    const coordinates = route.coordinates;
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord as [number, number]);
    }, new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));

    this.map.fitBounds(bounds, { padding: 50 });
  }

  clearRoute(): void {
    if (!this.map) return;

    if (this.map.getLayer(this.routeLayer)) {
      this.map.removeLayer(this.routeLayer);
    }

    if (this.map.getSource(this.routeSource)) {
      this.map.removeSource(this.routeSource);
    }

    this.currentRoute = null;
  }

  async searchPOIs(query: string, location: LocationData, category?: string): Promise<POI[]> {
    try {
      if (!mapboxgl.accessToken) {
        throw new Error('Mapbox access token not set');
      }

      let searchQuery = query;
      if (category) {
        searchQuery = `${category} ${query}`;
      }

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?proximity=${location.longitude},${location.latitude}&access_token=${mapboxgl.accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json();

      return data.features.map((feature: any) => ({
        id: feature.id,
        name: feature.place_name,
        category: this.categorizePlace(feature),
        latitude: feature.center[1],
        longitude: feature.center[0],
        address: feature.place_name,
        metadata: feature.properties
      }));
    } catch (error) {
      console.error('Failed to search POIs:', error);
      return [];
    }
  }

  private categorizePlace(feature: any): POI['category'] {
    const categories = feature.properties?.category?.split(',') || [];
    const placeName = feature.place_name?.toLowerCase() || '';

    if (categories.includes('hospital') || placeName.includes('hospital')) return 'hospital';
    if (categories.includes('police') || placeName.includes('police')) return 'police';
    if (categories.includes('fire') || placeName.includes('fire station')) return 'fire_station';
    if (categories.includes('pharmacy') || placeName.includes('pharmacy')) return 'pharmacy';
    if (categories.includes('restaurant') || placeName.includes('restaurant')) return 'restaurant';
    if (categories.includes('hotel') || placeName.includes('hotel')) return 'hotel';
    if (categories.includes('attraction') || placeName.includes('attraction')) return 'attraction';
    if (categories.includes('transport') || placeName.includes('station')) return 'transport';

    return 'attraction'; // Default category
  }

  displayPOIs(pois: POI[]): void {
    if (!this.map) return;

    // Clear existing POI markers
    this.clearPOIs();

    pois.forEach(poi => {
      const marker = new mapboxgl.Marker({
        color: this.getPOIColor(poi.category)
      })
        .setLngLat([poi.longitude, poi.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${poi.name}</h3>
              <p class="text-sm text-gray-600">${poi.address || ''}</p>
              ${poi.phone ? `<p class="text-sm">📞 ${poi.phone}</p>` : ''}
              ${poi.rating ? `<p class="text-sm">⭐ ${poi.rating}/5</p>` : ''}
            </div>
          `))
        .addTo(this.map);

      this.poiMarkers.push(marker);
    });
  }

  private getPOIColor(category: POI['category']): string {
    const colors = {
      hospital: '#e53e3e',
      police: '#3182ce',
      fire_station: '#d69e2e',
      pharmacy: '#38a169',
      restaurant: '#ed8936',
      hotel: '#805ad5',
      attraction: '#d53f8c',
      transport: '#319795'
    };
    return colors[category] || '#4a5568';
  }

  clearPOIs(): void {
    this.poiMarkers.forEach(marker => marker.remove());
    this.poiMarkers = [];
  }

  async downloadOfflineMap(bounds: mapboxgl.LngLatBounds, zoomLevels: number[] = [10, 11, 12, 13, 14]): Promise<boolean> {
    try {
      if (!mapboxgl.accessToken) {
        throw new Error('Mapbox access token not set');
      }

      const tilesToDownload: Array<{z: number, x: number, y: number}> = [];

      // Calculate tiles to download for each zoom level
      zoomLevels.forEach(zoom => {
        const tiles = this.getTilesInBounds(bounds, zoom);
        tilesToDownload.push(...tiles);
      });

      console.log(`Downloading ${tilesToDownload.length} tiles...`);

      // Download tiles in batches
      const batchSize = 10;
      for (let i = 0; i < tilesToDownload.length; i += batchSize) {
        const batch = tilesToDownload.slice(i, i + batchSize);
        await Promise.all(batch.map(tile => this.downloadTile(tile)));
      }

      console.log('Offline map download completed');
      return true;
    } catch (error) {
      console.error('Failed to download offline map:', error);
      return false;
    }
  }

  private getTilesInBounds(bounds: mapboxgl.LngLatBounds, zoom: number): Array<{z: number, x: number, y: number}> {
    // Convert bounds to tile coordinates
    const nw = this.deg2tile(bounds.getNorth(), bounds.getWest(), zoom);
    const se = this.deg2tile(bounds.getSouth(), bounds.getEast(), zoom);

    const tiles = [];
    for (let x = nw.x; x <= se.x; x++) {
      for (let y = nw.y; y <= se.y; y++) {
        tiles.push({ z: zoom, x, y });
      }
    }
    return tiles;
  }

  private deg2tile(lat: number, lon: number, zoom: number): {x: number, y: number} {
    const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y };
  }

  private async downloadTile(tile: {z: number, x: number, y: number}): Promise<void> {
    try {
      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/${tile.z}/${tile.x}/${tile.y}?access_token=${mapboxgl.accessToken}`;
      const response = await fetch(url);
      const data = await response.arrayBuffer();

      const tileKey = `${tile.z}-${tile.x}-${tile.y}`;
      this.offlineTiles.set(tileKey, {
        ...tile,
        data,
        style: 'streets-v12'
      });
    } catch (error) {
      console.error(`Failed to download tile ${tile.z}/${tile.x}/${tile.y}:`, error);
    }
  }

  enableOfflineMode(): void {
    this.isOfflineMode = true;
    console.log('Offline mode enabled');
  }

  disableOfflineMode(): void {
    this.isOfflineMode = false;
    console.log('Offline mode disabled');
  }

  isInOfflineMode(): boolean {
    return this.isOfflineMode;
  }

  getOfflineTileCount(): number {
    return this.offlineTiles.size;
  }

  clearOfflineTiles(): void {
    this.offlineTiles.clear();
    console.log('Offline tiles cleared');
  }

  // Navigation helpers
  getNextNavigationStep(): NavigationStep | null {
    if (!this.currentRoute || this.currentRoute.steps.length === 0) {
      return null;
    }
    return this.currentRoute.steps[0];
  }

  getCurrentRoute(): NavigationRoute | null {
    return this.currentRoute;
  }

  getMap(): mapboxgl.Map | null {
    return this.map;
  }
}

export const advancedMapService = new AdvancedMapService();